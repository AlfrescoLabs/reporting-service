node('reportingsrv') {
  ws('reportingservice') {
    stage 'Checkout'
    git url: 'https://github.com/AlfrescoTestAutomation/reporting-service.git'

    docker.withRegistry('https://alfness:5000') {
      stage 'Build docker Image'
      def newImage = docker.build('test-platform/backend:latest')

      stage 'Test Container'
      withCredentials([[$class: 'StringBinding', credentialsId: 'b596801f-4698-4b7f-9643-51d8c7c5052e', variable: 'jiraurl'],
                       [$class: 'StringBinding', credentialsId: '01465e89-0dc3-4889-99f2-df5e8277f1e7', variable: 'jiraauth'],
                       [$class: 'StringBinding', credentialsId: '2cd3a76d-c77d-4443-89e1-83c5633edaaf', variable: 'testlinkurl'],
                       [$class: 'StringBinding', credentialsId: '452d6b15-651d-4678-94a5-0d5a33d4c3c3', variable: 'testlinkauth'],
                       [$class: 'StringBinding', credentialsId: '8f184ef7-4c2f-4dd9-b5c0-a6f36e3b73c2', variable: 'mongonode']]) {
      sh 'docker run -e \"NODE_ENV=test\" -e \"NODE_HOST=localhost\" -e \"NODE_MONGO=${mongonode}\" -e \"JIRA_URL=${jiraurl}\" -e \"JIRA_AUTH=${jiraauth}\" -e \"TESTLINK_URL=${testlinkurl}\" -e \"TESTLINK_KEY=${testlinkauth}\" -P test-platform/backend:latest test'
      }

      stage 'Push latest tag'
      newImage.push(['latest'])

      stage 'Deploy Dev'
      sh 'docker ps -f "name=reporting-dev" -q | while read line; do docker stop "$line"; docker rm "$line"; done'
      sh 'docker ps -alf "name=reporting-dev" -q | while read line; do docker stop "$line"; docker rm "$line"; done'
      withCredentials([[$class: 'StringBinding', credentialsId: 'b596801f-4698-4b7f-9643-51d8c7c5052e', variable: 'jiraurl'],
                       [$class: 'StringBinding', credentialsId: '01465e89-0dc3-4889-99f2-df5e8277f1e7', variable: 'jiraauth'],
                       [$class: 'StringBinding', credentialsId: '2cd3a76d-c77d-4443-89e1-83c5633edaaf', variable: 'testlinkurl'],
                       [$class: 'StringBinding', credentialsId: '452d6b15-651d-4678-94a5-0d5a33d4c3c3', variable: 'testlinkauth'],
                       [$class: 'StringBinding', credentialsId: '8f184ef7-4c2f-4dd9-b5c0-a6f36e3b73c2', variable: 'mongonode']]) {
      def devContainer =
          docker.image('alfness:5000/test-platform/backend:latest')
          .run('-p 9100:3000 \
              --name reporting-dev \
              -e "SERVICE_NAME=Reporting-Service-DEV" \
              -e "SERVICE_ID=repsrv:reporting-dev:9100" \
              -e "SERVICE_CHECK_HTTP=/" \
              -e "SERVICE_CHECK_INTERVAL=15s" \
              -e "NODE_ENV=development" \
              -e "NODE_HOST=localhost" \
              -e "NODE_MONGO=${mongonode}" \
              -e "JIRA_URL=${jiraurl}" \
              -e "JIRA_AUTH=${jiraauth}" \
              -e "TESTLINK_URL=${testlinkurl}" \
              -e "TESTLINK_KEY=${testlinkauth}"')
      echo devContainer.id
      }
      stage 'Promote to Prod?'
      input 'Do you want to deploy on prod?'

      sh 'docker ps -f "name=reporting-prod" -q | while read line; do docker stop "$line"; docker rm "$line"; done'
      sh 'docker ps -alf "name=reporting-prod" -q | while read line; do docker stop "$line"; docker rm "$line"; done'
      def prodContainer =
          docker.image('alfness:5000/test-platform/backend:latest')
          .run('-p 9000:3000 \
          --name reporting-prod \
          -e "SERVICE_NAME=Reporting-Service-PROD" \
          -e "SERVICE_ID=repsrv:reporting-prod:9000" \
          -e "SERVICE_CHECK_HTTP=/" \
          -e "SERVICE_CHECK_INTERVAL=15s" \
          -e "NODE_ENV=prod" \
          -e "NODE_HOST=localhost" \
          -e "NODE_MONGO=${mongonode}" \
          -e "JIRA_URL=${jiraurl}" \
          -e "JIRA_AUTH=${jiraauth}" \
          -e "TESTLINK_URL=${testlinkurl}" \
          -e "TESTLINK_KEY=${testlinkauth}"')
      echo prodContainer.id

    }
  }
}
