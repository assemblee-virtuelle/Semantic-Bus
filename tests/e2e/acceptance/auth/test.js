Feature('Test acceptance ');

Scenario('Test the admin panel in the admin dashboard @local', (I) => {
  // Access to the admin menu
  I.amOnPage('/ihm/login.html#connexion');
  // I.amOnPage('http://localhost:8080/dashboard/');
  I.seeInCurrentUrl('/ihm/login.html#connexion');
  // I.seeInCurrentUrl('semanticbus.docker/');
  // I.grabBrowserLogs()
  //  .then((logs) => {
  //    console.log(JSON.stringify(logs));
  // });
  I.wait(10);
  I.see('Grappe')
  I.saveScreenshot('bus.png');
});
