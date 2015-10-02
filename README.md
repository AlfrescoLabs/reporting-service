# Reporting service #
Test platform reporting module, provides historical data stored in mongodb ,which
has been collected from jira. This module is built with nodejs and is a simple
service that provides data and stores data using REST.
## To run test
 type mocha
## To run service
 node app.js
## Implemented APIs
 * Get open and closed defects from JIRA for a given day and store it.
 * Show all defects for the product release.

## Examples

### Get all open defects for product release
http://localhost:3000/reporting/api/alfresco/5.1/status
expected result:

```[{
_id: "560d293d985a1b1583dee3be",
date: "9/22/2015",
open: {
count: 27,
critical: 14,
blocker: 13,
issues: [
{
id: "ACE-4290",
link: "https://issuestest.alfresco.com/jira/rest/api/2/issue/148825",
type: "Blocker"
},
close: {
count: 5,
critical: 3,
blocker: 2,
issues: [
{
id: "ACE-4285",
link: "https://issuestest.alfresco.com/jira/rest/api/2/issue/148748",
type: "Blocker"
}]
```
### Query JIRA and store data###
Store data from today.
http://localhost:3000/reporting/api/alfresco/5.1
Stroe from a specific date.
http://localhost:3000/reporting/api/alfresco/5.1/20/09/2015
