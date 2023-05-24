import * as React from 'react';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { Button, InputAdornment, OutlinedInput, Typography, Stack, SvgIcon } from '@mui/material';

const NodePackageQuery = "https://api.npms.io/v2/search?q=";
const SemantricsAPI = "https://rcn3mxcjwd.execute-api.us-east-1.amazonaws.com/dev/";
const SemantricsAPIKey = "cd332ee0-3f81-418d-aba2-aa0a99ff5ba7";
const UserId = "ab498ded-1dd2-4a60-82ef-4f54cd24ac31";

export default function MyApp() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [resultList, setResultList] = React.useState([]); 
  const [loadingStatus, setLoadingStatus] = React.useState(false);

  // Track state of search query
  const handleTextInputChange = event => {
    console.log("query change: ", event.target.value);
    setSearchQuery(event.target.value);
  };

  // Load the results from the NPM API
  const handleSearchButtonClick = async event => {
    setLoadingStatus(true);
    console.log("click search and query: ", searchQuery);

    // Register query with Semantrics. Fire and forget
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        "interfaceKey": SemantricsAPIKey,
        "userId": UserId,
        "query": searchQuery,
        "metadata": ["experimentA", "variantC"],
        "queryTime": new Date().getTime()
      })
    };
    fetch(SemantricsAPI + 'query', requestOptions);

    let headers = new Headers({
        "Accept"       : "application/json",
        "Content-Type" : "application/json",
        "User-Agent"   : navigator.userAgent
    });
    const response = await fetch(NodePackageQuery + encodeURIComponent(searchQuery), { 
      method  : 'GET', 
      headers : headers });
    const data = await response.json();

    // Register results with Semantrics. Fire and forget.
    const requestROptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        "interfaceKey": SemantricsAPIKey,
        "userId": UserId,
        "query": searchQuery,
        "results": data["results"].map((item, index) => {
          return {
            name: item.package.name,
            url: item.package.links.npm,
            index: index
          };
        }),
        "resultReturnTime": new Date().getTime()
      })
    };
    fetch(SemantricsAPI + 'results', requestROptions);

    const tempResultList = data["results"].map((item, index) => {
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
    console.log("click result: ", result);
    window.open(result.url, "_blank");
    
    // Register interaction with Semantrics
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        "interfaceKey": SemantricsAPIKey,
        "userId": UserId,
        "query": searchQuery,
        "resultName": result.title,
        "resultRow": result.index,
        "interactionTime": new Date().getTime()
      })
    };
    fetch(SemantricsAPI + 'interaction', requestOptions);
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
          Semantrics Demo App
        </Typography>
      </Stack>
      <Stack
        alignItems="center"
        direction="row"
        spacing={1}
      >
        <OutlinedInput
          defaultValue=""
          fullWidth
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
          sx={{ maxWidth: "20%" }}
        />
        <Button
          color="primary"
          fontSize="large"
          sx={{ ml: 2 }}
          onClick={handleSearchButtonClick}
          variant="contained"
        >
          Search
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