import * as React from 'react';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { Button, InputAdornment, OutlinedInput, Typography, Stack, SvgIcon } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const NodePackageQuery = "https://api.npms.io/v2/search?q=";
const SemantricsAPI = "https://rcn3mxcjwd.execute-api.us-east-1.amazonaws.com/dev/";
const SemantricsAPIKey = "cd332ee0-3f81-418d-aba2-aa0a99ff5ba7";

export default function MyApp() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [resultList, setResultList] = React.useState([]); 
  const [loadingStatus, setLoadingStatus] = React.useState(false);
  const [userId, setUserId] = React.useState(uuidv4());

  // Track state of search query
  const handleTextInputChange = event => {
    setSearchQuery(event.target.value);
    if (resultList.length > 0) {
      setResultList([]);
    }
  };

  // Load the results from the NPM API
  const handleSearchButtonClick = async event => {
    setLoadingStatus(true);
    // Register query with Semantrics. Fire and forget
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        "interfaceKey": SemantricsAPIKey,
        "userId": userId,
        "query": searchQuery,
        "metadata": ["experimentA", "variantC"],
        "queryTime": new Date().getTime()
      })
    };
    console.log("posting search to Semantrics: " + JSON.stringify(requestOptions.body));
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
        "userId": userId,
        "query": searchQuery,
        "results": data["results"].filter(function (item, index) { return index < 10 }).map((item, index) => {
          return {
            name: item.package.name,
            url: item.package.links.npm,
            index: index
          };
        }),
        "resultReturnTime": new Date().getTime()
      })
    };
    console.log("posting result list to Semantrics: " + JSON.stringify(requestOptions.body));
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
    window.open(result.url, "_blank");
    
    // Register interaction with Semantrics
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        "interfaceKey": SemantricsAPIKey,
        "userId": userId,
        "query": searchQuery,
        "resultName": result.title,
        "resultRow": result.index,
        "interactionTime": new Date().getTime()
      })
    };
    console.log("posting click to Semantrics: " + JSON.stringify(requestOptions.body));
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
        spacing={2}
      >
        <Typography 
          color="primary"
          variant="body">
          <b>User ID:</b> {userId}
        </Typography>
        <Button
          color="primary"
          fontSize="large"
          onClick={() => { setUserId(uuidv4()); }}
          variant="contained"
        >
          New User
        </Button>
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
          onKeyPress={event => {
            if (event.key === 'Enter') {
              handleSearchButtonClick();
            }
          }}
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