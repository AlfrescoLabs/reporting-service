# Reporting service #
Test platform reporting module, provides historical data stored in mongodb ,which
has been collected from jira. This module is built with nodejs and is a simple
service that provides data and stores data using REST.
## Install
npm install
## To run test
npm test
## To run service
npm start
## Implemented APIs
 * Get open and closed defects from JIRA for a given day and store it.
 * Show all defects for the product release.

## Examples

### Get all open defects for product release



### Query JIRA and store data###
Store defects created from today.
http://localhost:3000/reporting/api/alfresco/5.1/defects/created
Store defects created from a specific date.
http://localhost:3000/reporting/api/alfresco/5.1/defects/created/20/09/2015
Display defects created summary for charting
http://localhost:3000/reporting/api/alfresco/5.1/defects/created/summary
Store open defects from today.
http://localhost:3000/reporting/api/alfresco/5.1/defects/open
Display open defects trend summary for charting
http://localhost:3000/reporting/api/alfresco/5.1/defects/open/summary
