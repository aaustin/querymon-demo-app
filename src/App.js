import * as React from 'react';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { Button, InputAdornment, OutlinedInput, Typography, Stack, SvgIcon } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { Querymon } from 'querymon';

const NodePackageQuery = "https://registry.npmjs.org/-/v1/search?text=";

const QuerymonAPIKey = "76839480-01d3-4a13-be96-528ef7a64944";
const INITIAL_USER_ID = uuidv4();

const querymon = new Querymon({
  searchInterfaceKey: QuerymonAPIKey,
  userId: INITIAL_USER_ID
});

export default function MyApp() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [resultList, setResultList] = React.useState([]); 
  const [loadingStatus, setLoadingStatus] = React.useState(false);
  

  React.useEffect(() => {
    if (searchQuery !== "") {
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  // Track state of search query
  const handleTextInputChange = event => {
    setSearchQuery(event.target.value);
    if (resultList.length > 0) {
      setResultList([]);
    }
  };

  // Load the results from the NPM API
  const handleSearch = async query => {
    setLoadingStatus(true);
    
    // Register query with Querymon. Fire and forget
    querymon.logSearch(query);
    
    let headers = new Headers({
        "User-Agent"   : navigator.userAgent
    });
    const response = await fetch(NodePackageQuery + encodeURIComponent(query), { 
      method  : 'GET', 
      headers : headers });
    const data = await response.json();

    if (query !== searchQuery) {
      return;
    }

    // Register results with Querymon. Fire and forget.
    querymon.logResults(query, data["objects"].map((item, index) => {
      return {
        entityId: item.package.name + "-" + item.package.version,
        name: item.package.name,
        url: item.package.links.npm,
        index: index
      };
    }));

    const tempResultList = data["objects"].map((item, index) => {
      return {
        title: item.package.name,
        version: item.package.version,
        description: item.package.description,
        url: item.package.links.npm,
        index: index
      }
    });
    setResultList(tempResultList);
    setLoadingStatus(false);
  };

  // Handle clicking on a result
  const handleResultItemClick = async (result) => {
    window.open(result.url, "_blank");
    
    // Register interaction with Querymon
    querymon.logClick(searchQuery, result.index, result.title);
  };

  const handleConversionEventClick = async () => {
    // Register conversion event with Querymon
    querymon.logConversion("purchase", { "eventValue": Math.floor(Math.random() * 10000) });
  };

  return (
    <Stack spacing={3}>
      <Stack
        alignItems="center"
        direction="row"
        spacing={1}
      >
        <SvgIcon
          fontSize="large"
          color="primary">
          <QueryStatsIcon />
        </SvgIcon>
        <Typography 
          color="primary"
          variant="h6">
          Querymon Demo App
        </Typography>
      </Stack>
      <Stack
        alignItems="center"
        direction="row"
        spacing={2}
      >
        <OutlinedInput
          defaultValue=""
          placeholder="Search NPM Packages"
          onChange={handleTextInputChange}
          startAdornment={(
            <InputAdornment
              position="start">
              <SvgIcon
                color="action"
                fontSize="small"
              >
                <MagnifyingGlassIcon />
              </SvgIcon>
            </InputAdornment>
          )}
          sx={{ width: "25%" }}
        />
        <Button
          color="primary"
          fontSize="large"
          onClick={handleConversionEventClick}
          variant="contained"
        >
          Sim Conversion Event
        </Button>
      </Stack>
      {loadingStatus ?
      (<Typography
        color="primary"
        variant="h6">
        Loading...
      </Typography>) :
      (<Stack>
        {resultList.map((result, index) => {
        return (
          <Button
            key={index}
            sx={{ justifyContent: 'flex-start', width: "30%" }}
            onClick={() => { handleResultItemClick(result); }}>
            <Stack>
              <Stack
                direction="row"
                spacing={1}
              >
                <Typography
                  color="primary"
                  variant="h6"
                >
                  {result.index + 1}.
                </Typography>
                <Typography
                  color="primary"
                  variant="h6"
                >
                  {result.title}: {result.version}
                </Typography>
              </Stack>
              <Typography
                color="primary"
                textAlign={"left"}
                variant="body"
              >
                {result.description}
              </Typography>
            </Stack>
          </Button>
        )})}
      </Stack>)}
    </Stack>
  );
}