# Reporting service #
Test platform reporting module, provides historical data stored in mongodb ,which
has been collected from jira. This module is built with nodejs and is a simple
service that provides data and stores data using REST.
## To run test ##
 type mocha

### To run service
 node app.js

## Implemented APIs ##
 * Get open and closed defects from JIRA for a given day and store it.
 * Show all defects for the product release.
