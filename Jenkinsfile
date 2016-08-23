
properties([
    [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '10']],
    [$class: 'ParametersDefinitionProperty', parameterDefinitions: [
      [$class: 'ChoiceParameterDefinition', choices: 'yes\nno', name: 'Checkout_and_Test'],
      [$class: 'ChoiceParameterDefinition', choices: 'yes\nno', name: 'Build_and_Push_Image'],
      [$class: 'ChoiceParameterDefinition', choices: 'yes\nno', name: 'Deploy_Dev'],
      [$class: 'ChoiceParameterDefinition', choices: 'no\nyes', name: 'Deploy_Prod']
      ]
    ]
  ])

node('reportingsrv') {
  ws('reportingservice') {

    docker.withRegistry('https://docker-internal.alfresco.com') {
    withCredentials([[$class: 'StringBinding', credentialsId: 'b596801f-4698-4b7f-9643-51d8c7c5052e', variable: 'JIRA_URL'],
                      [$class: 'StringBinding', credentialsId: '01465e89-0dc3-4889-99f2-df5e8277f1e7', variable: 'JIRA_AUTH'],
                      [$class: 'StringBinding', credentialsId: '2cd3a76d-c77d-4443-89e1-83c5633edaaf', variable: 'TESTLINK_URL'],
                      [$class: 'StringBinding', credentialsId: '452d6b15-651d-4678-94a5-0d5a33d4c3c3', variable: 'TESTLINK_KEY']]) {

    if (Checkout_and_Test == "yes") {

      stage 'Checkout'
      git url: 'https://github.com/AlfrescoTestAutomation/reporting-service.git'

      stage 'Test Build'
      withEnv(['NODE_ENV=test','NODE_MONGO=']) {
        sh 'npm install && mocha test --timeout 15000'
      }
    }

    if ( Build_and_Push_Image == "yes" ) {
      stage 'Build docker Image'
      def newImage = docker.build('test-platform/backend:latest')

      stage 'Push latest tag'
      newImage.push(['latest'])
    }

      withCredentials([[$class: 'StringBinding', credentialsId: '8f184ef7-4c2f-4dd9-b5c0-a6f36e3b73c2', variable: 'NODE_MONGO']]) {

    if ( Deploy_Dev == "yes" ) {

      stage 'Deploy Dev'
      sh 'docker ps -f "name=backend-dev" -q | while read line; do docker stop "$line"; docker rm "$line"; done'
      sh 'docker ps -alf "name=backend-dev" -q | while read line; do docker stop "$line"; docker rm "$line"; done'

      def devContainer =
          docker.image('docker-internal.alfresco.com/test-platform/backend:latest')
          .run('-p 172.29.102.94:9100:3000 \
              --name backend-dev \
              -e "SERVICE_NAME=Reporting-Service-DEV" \
              -e "SERVICE_ID=repsrv:backend-dev:9100" \
              -e "SERVICE_CHECK_HTTP=/" \
              -e "SERVICE_CHECK_INTERVAL=120s" \
              -e "NODE_ENV=development" \
              -e "NODE_HOST=localhost" \
              -e "NODE_MONGO=${NODE_MONGO}" \
              -e "JIRA_URL=${JIRA_URL}" \
              -e "JIRA_AUTH=${JIRA_AUTH}" \
              -e "TESTLINK_URL=${TESTLINK_URL}" \
              -e "TESTLINK_KEY=${TESTLINK_KEY}"')
      echo devContainer.id

    }

    if ( Deploy_Prod == "yes" ) {
      stage 'Deploy_Prod'

      sh 'docker ps -f "name=backend-prod" -q | while read line; do docker stop "$line"; docker rm "$line"; done'
      sh 'docker ps -alf "name=backend-prod" -q | while read line; do docker stop "$line"; docker rm "$line"; done'
      def prodContainer =
          docker.image('docker-internal.alfresco.com/test-platform/backend:latest')
          .run('-p 172.29.102.94:9000:3000 \
          --name backend-prod \
          -e "SERVICE_NAME=Reporting-Service-PROD" \
          -e "SERVICE_ID=repsrv:backend-prod:9000" \
          -e "SERVICE_CHECK_HTTP=/" \
          -e "SERVICE_CHECK_INTERVAL=120s" \
          -e "NODE_ENV=prod" \
          -e "NODE_HOST=localhost" \
          -e "NODE_MONGO=${NODE_MONGO}" \
          -e "JIRA_URL=${JIRA_URL}" \
          -e "JIRA_AUTH=${JIRA_AUTH}" \
          -e "TESTLINK_URL=${TESTLINK_URL}" \
          -e "TESTLINK_KEY=${TESTLINK_KEY}"')
      echo prodContainer.id
      }
     }
     }
    }
  }
}
