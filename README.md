# football_external_adapter
External Adapter to fetch results from api-football https://rapidapi.com/api-sports/api/api-football/


Steps:
yarn

// Create an API key from the above link
export API_KEY="...."

yarn start

curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{"id": 0,"data":{"fixtureId": "157201"}}'

Result will look like this:
{"jobRunID":"1","data":{"winner":"Manchester United","result":"Manchester United"},"result":"Manchester United","statusCode":200}