
'use strict'
const assert = require('assert')
const fs = require('fs')
// var chai = require('chai');
// var chaiWebdriver = require('chai-webdriverio').default;
// chai.use(chaiWebdriver(browser));

// describe('First Test Group', () => {
//   it('gets the title of MDN toppage', () => {
//     const title = browser.url('/ihm/application.html').getTitle();
//     assert.equal(title, 'Bus Sémantique')
//   })
// })



// describe('Worksapce List', () => {
//   it('should demonstrate the click command', function () {
//     // browser.url('http://localhost:8080/ihm/application.html')
//     browser.waitUntil(() => {
//       $('navigation').isVisible();
//     }, 3000)
//     // console.log(3)

//     // let workSpaceSelector = 'div[name="workspaceSelector"]';

//     // // browser.waitForVisible(workSpaceSelector,3000);

//     // $(workSpaceSelector).click();
//   })
// })

describe('connexion with normal compte', () => {
  it('Nous devons arriver sur application.html', function () {
      // receive screenshot as Buffer   
      var url = browser.url('/auth/login.html')    
      browser.waitUntil(() => {
       return $('form').isVisible();
      }, 5000)
      // // browser.waitForExist('navigation', 10000)
      let email = 'input[name="email"]';
      browser.waitForVisible(email,3000);
      browser.setValue(email, 'alexbocenty@hotmail.fr')
      let password = 'input[name="password"]';
      browser.setValue(password, 'azerty')
      $('#btn2').click();
      expect(browser.getUrl()).to.be.equal('https://semantic-bus.org/ihm/application.html');
      browser.waitForVisible('navigation');
      let workSpaceSelector = 'div[name="workspaceSelector"]';
      browser.waitForVisible(workSpaceSelector,3000);
      $(workSpaceSelector).click();
      browser.waitForVisible('div.commandBar.containerH > div.commandButton',3000);
      // var buttonAddWorkspace = browser.selectByValue('div.commandBar.containerH > div.commandButton','+');
      $('div.commandBar.containerH > div.commandButton').click();
  })
})
