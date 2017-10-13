'use strict'
const assert = require('assert');

///WS1 SCENARIO DE TEST ////
var token;
var workspaceId;
describe('workspaces and components ', () => {
  it('01 connexion', function() {
    ///CONNEXION
    var url = browser.url('/auth/login.html')
    // browser.waitUntil(() => {
    //   return $('form').isVisible();
    // })
    //browser.waitForVisible('form');
    let email = '#email';
    browser.waitForVisible(email);
    browser.setValue(email, 'alexfoot32@orange.fr')
    let password = '#password';
    browser.setValue(password, 'azerty')
    //$('#btn2').click();
    browser.click('#btn2');
    browser.waitForVisible('navigation', 10000);
    //expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/ihm/application.html');
    //token = browser.localStorage('GET', 'token').value;
  })
  it('02 workspace add', function() {
    browser.click('#workspaceSelector');
    browser.waitForVisible('.test-addRow');
    browser.click('.test-addRow');
    browser.waitForVisible('workspace-editor');
    browser.waitForVisible('#workspaceNameInput'); //on doit pouvoir directement saisir le nom du WS
  })

  it('03 workspace set information and save', function() {
    browser.setValue('#workspaceNameInput', 'workspace de test');
    browser.setValue('#workspaceDescriptionInput', 'description du workspace de test');
    browser.click('#save');
    browser.waitUntil(() => {
      return browser.getAttribute('workspace-editor', 'data-id') != undefined;
    });
    workspaceId = browser.getAttribute('workspace-editor', 'data-id');
  })
  it('04 check new workspace in my workspaces', function() {
    browser.click('#workspaceSelector');
    browser.waitForVisible('workspace-table');
    browser.waitForVisible('div[data-id="' + workspaceId + '"]');
  })
  it('05 show existing workspace', function() {
    browser.element('div[data-id="' + workspaceId + '"]').click('.commandButton');
    browser.waitForVisible('workspace-editor');
    browser.waitForVisible('graph');
  })
  it('06 add a component', function() {
    browser.waitForVisible('#addComponent');
    browser.click('#addComponent');
    browser.waitForVisible('technical-component-table');
    //browser.waitForVisible('div=GOOGLE calc Get JSON');
    browser.click('div=GOOGLE calc Get JSON');
    browser.click('#addComponent');
    //browser.waitForVisible('#containerloaderDiv');
    browser.waitUntil(() => {
      return !browser.isVisible('#containerloaderDiv');
    });
    browser.waitForVisible('graph');
  })
  it('07 add a second component', function() {
    browser.waitForVisible('#addComponent');
    browser.click('#addComponent');
    browser.waitForVisible('technical-component-table');
    //browser.waitForVisible('div=GOOGLE calc Get JSON');
    browser.click('div=Object Transformer');
    browser.click('#addComponent');
    //browser.waitForVisible('#containerloaderDiv');
    browser.waitUntil(() => {
      return !browser.isVisible('#containerloaderDiv');
    });
    browser.waitForVisible('graph');
  })
  it('08 edit first component', function() {
    let elmts = browser.elements('graph image');
    (elmts.value)[0].click();
    browser.click('#editButton');
    browser.waitForVisible('workspace-component-editor');
    browser.setValue('#keyInput', '1v-jNViOm8dEnCPYErX-TkbpMSroTA4TzUePhxSleAYo/edit#gid=0');
    browser.setValue('#selectInput', 'select A,B');
    browser.setValue('#offsetInput', '1');
    browser.setValue('#nameComponentInput', 'requetage d\'un google sheet simple');
    browser.click('#saveButton');
    //browser.waitForVisible('#containerloaderDiv');
    browser.waitUntil(() => {
      return !browser.isVisible('#containerloaderDiv');
    });
    browser.click('#backButton');
    browser.waitForVisible('graph');
  })
  it('09 work first component by graph', function() {
    let elmts = browser.elements('graph image');
    (elmts.value)[0].click();
    browser.click('#workButton');
    browser.waitForVisible('jsonPreviewer');
    browser.click('#backButton');
    browser.waitForVisible('graph');
  })
  it('10 work first component by editor', function() {
    let elmts = browser.elements('graph image');
    (elmts.value)[0].click();
    browser.click('#editButton');
    browser.waitForVisible('workspace-component-editor');
    browser.click('#workButton');
    browser.waitForVisible('jsonPreviewer');
    browser.click('#backButton');
    browser.click('#backButton');
    browser.waitForVisible('graph');
  })
  it('11 connect 2 components and work second', function() {
    let elmts = browser.elements('graph image');
    (elmts.value)[0].click();
    browser.click('#connectAfterButton');
    (elmts.value)[1].click();
    //browser.waitForVisible('#containerloaderDiv');
    browser.waitUntil(() => {
      return !browser.isVisible('#containerloaderDiv');
    });
    (elmts.value)[1].click();
    browser.click('#workButton');
    browser.waitForVisible('jsonPreviewer');
  })
  it('12 delete worksapce', function() {
    browser.click('#workspaceSelector');
    browser.waitForVisible('workspace-table');
    browser.waitForVisible('div[data-id="' + workspaceId + '"]');
    browser.click('div[data-id="' + workspaceId + '"]');
    browser.click('.test-delRow');
    //browser.waitForVisible('#containerloaderDiv');
    browser.waitUntil(() => {
      return !browser.isVisible('#containerloaderDiv');
    });
  })
})
//
//     // ACCES LISTE WORKSPACE
//     $(workSpaceSelector).click();
//     browser.waitForVisible('workspace-table');
//
//     // MODE AJOUT D'UN WORKSPACE //(edit mode de base quand on creer un workspace)
//     $('zentable').$('.test-addRow').click()
//     browser.waitForVisible('workspace-editor');
//
//     // // AJOUT D'UN  COMPONENT //
//     // $('zentable').$('div.commandButton').click();
//     // browser.waitForVisible('technical-component-table');
//     // $('technical-component-table').$('zentable').$('div[name="tableBody"]').click();
//     // browser.waitForVisible('workspace-editor');
//     // // AJOUT D'UN USER
//
//     // //DEPLACEMENT SUR LE MENU USER
//     // browser.waitUntil(() => {
//     //    if(browser.isVisible('#containerloaderDiv') == false){
//     //      return true
//     //     };
//     // }, 50000, 'le loader doit avoir disparue')
//
//     // $('workspace-editor').$('div.white').click()
//
//     // // EDIT MODE //
//     // $('workspace-editor').$('div.commandButton').click()
//
//     // // CLICK SUR PLUS //
//     // browser.waitForVisible('zentable');
//     // $('#userliste').$('div.commandButton').click();
//
//     // /// REMPLISSAGE LIST USER ///
//     // browser.waitForVisible('user-list');
//     // browser.setValue('#users-list', 'semanticbusdev@gmail.com')
//
//     // /// PARTAGE DU WORKSPACE
//     // $('user-list').$('.share-btn').click()
//     // $('#cancel').click()
//
//     // //ADD DESCRIPTION
//     // console.log("test et")
//     // $('#backBar').click()
//   })
//
//
// MODE AJOUT D'UN WORKSPACE //(edit mode de base quand on creer un workspace)
// $('zentable').$('.test-addRow').click()
// browser.waitForVisible('workspace-editor');
//
// // AJOUT D'UN  COMPONENT //
// $('zentable').$('div.commandButton').click();
// browser.waitForVisible('technical-component-table');
// $('technical-component-table').$('zentable').$('div[name="tableBody"]').click();
// browser.waitForVisible('workspace-editor');
// // AJOUT D'UN USER
//
// //DEPLACEMENT SUR LE MENU USER
// browser.waitUntil(() => {
//    if(browser.isVisible('#containerloaderDiv') == false){
//      return true
//     };
// }, 50000, 'le loader doit avoir disparue')
//
// $('workspace-editor').$('div.white').click()
//
// // EDIT MODE //
// $('workspace-editor').$('div.commandButton').click()
//
// // CLICK SUR PLUS //
// browser.waitForVisible('zentable');
// $('#userliste').$('div.commandButton').click();
//
// /// REMPLISSAGE LIST USER ///
// browser.waitForVisible('user-list');
// browser.setValue('#users-list', 'semanticbusdev@gmail.com')
//
// /// PARTAGE DU WORKSPACE
// $('user-list').$('.share-btn').click()
// $('#cancel').click()
//
// //ADD DESCRIPTION
// console.log("test et")
// $('#backBar').click()
//       })
// })
//
// describe('test storage', () => {
//   it('set storage', function () {
//       console.log('set',token);
//       expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/ihm/application.html');
//
//   })
// })
//
//
//
// describe('connexion et supression d\'un wrkspace', () => {
//   it('on devrait arriver sur la listes des worksapces avec notre workspace selectionné suprrimé', function () {
//       ///CONNEXION
//       var url = browser.url('/auth/login.html')
//       browser.waitUntil(() => {
//        return $('form').isVisible();
//       }, 5000)
//       let email = 'input[name="email"]';
//       browser.waitForVisible(email,3000);
//       browser.setValue(email, 'alexbocenty@hotmail.fr')
//       let password = 'input[name="password"]';
//       browser.setValue(password, 'azerty')
//       $('#btn2').click();
//       expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/ihm/application.html');
//       browser.waitForVisible('navigation');
//       let workSpaceSelector = 'div[name="workspaceSelector"]';
//       browser.waitForVisible(workSpaceSelector,3000);
//
//       // ACCES LISTE WORKSPACE
//       $(workSpaceSelector).click();
//       browser.waitForVisible('workspace-table');
//
//       // SELECTION D'UN WORKSPACE DANS LA LISTE ET SUPRESSION //
//
//
//
//     })
// })
//
//
//
//
// describe('inscription', () => {
//   it('on devrait arriver sur application.html', function () {
//       ///CONNEXION
//       var url = browser.url('/auth/login.html')
//       browser.waitUntil(() => {
//        return $('form').isVisible();
//       }, 5000)
//       let email = 'input[name="email"]';
//       browser.waitForVisible(email,3000);
//       browser.setValue(email, 'alexbocenty@hotmail.fr')
//       let password = 'input[name="password"]';
//       browser.setValue(password, 'azerty')
//       $('#btn2').click();
//       expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/ihm/application.html');
//       browser.waitForVisible('navigation');
//       let workSpaceSelector = 'div[name="workspaceSelector"]';
//       browser.waitForVisible(workSpaceSelector,3000);
//
//       // ACCES LISTE WORKSPACE
//       $(workSpaceSelector).click();
//       browser.waitForVisible('workspace-table');
//
//       // SELECTION D'UN WORKSPACE DANS LA LISTE ET SUPRESSION //
//
//     })
// })
//
//
//
//
// describe('deconnexion', () => {
//   it('on devrait arriver sur login.html', function () {
//       ///CONNEXION
//       var url = browser.url('/auth/login.html')
//       browser.waitUntil(() => {
//        return $('form').isVisible();
//       }, 5000)
//       let email = 'input[name="email"]';
//       browser.waitForVisible(email,3000);
//       browser.setValue(email, 'alexbocenty@hotmail.fr')
//       let password = 'input[name="password"]';
//       browser.setValue(password, 'azerty')
//       $('#btn2').click();
//       expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/ihm/application.html');
//       browser.waitForVisible('navigation');
//       let workSpaceSelector = 'div[name="workspaceSelector"]';
//       browser.waitForVisible(workSpaceSelector,3000);
//
//       // ACCES LISTE WORKSPACE
//       $(workSpaceSelector).click();
//       browser.waitForVisible('workspace-table');
//
//       // SELECTION D'UN WORKSPACE DANS LA LISTE ET SUPRESSION //
//
//     })
// })
//
//
//
//
// describe('modification email', () => {
//   it('on devrait voir son email modifier', function () {
//       ///CONNEXION
//       var url = browser.url('/auth/login.html')
//       browser.waitUntil(() => {
//        return $('form').isVisible();
//       }, 5000)
//       let email = 'input[name="email"]';
//       browser.waitForVisible(email,3000);
//       browser.setValue(email, 'alexbocenty@hotmail.fr')
//       let password = 'input[name="password"]';
//       browser.setValue(password, 'azerty')
//       $('#btn2').click();
//       expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/ihm/application.html');
//       browser.waitForVisible('navigation');
//       let workSpaceSelector = 'div[name="workspaceSelector"]';
//       browser.waitForVisible(workSpaceSelector,3000);
//
//       // ACCES LISTE WORKSPACE
//       $(workSpaceSelector).click();
//       browser.waitForVisible('workspace-table');
//
//       // SELECTION D'UN WORKSPACE DANS LA LISTE ET SUPRESSION //
//
//     })
// })
//
//
// describe('tester un workspace', () => {
//   it('on devrait voir le flux tiré', function () {
//       ///CONNEXION
//       var url = browser.url('/auth/login.html')
//       browser.waitUntil(() => {
//        return $('form').isVisible();
//       }, 5000)
//       let email = 'input[name="email"]';
//       browser.waitForVisible(email,3000);
//       browser.setValue(email, 'alexbocenty@hotmail.fr')
//       let password = 'input[name="password"]';
//       browser.setValue(password, 'azerty')
//       $('#btn2').click();
//       expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/ihm/application.html');
//       browser.waitForVisible('navigation');
//       let workSpaceSelector = 'div[name="workspaceSelector"]';
//       browser.waitForVisible(workSpaceSelector,3000);
//
//       // ACCES LISTE WORKSPACE
//       $(workSpaceSelector).click();
//       browser.waitForVisible('workspace-table');
//
//       // SELECTION D'UN WORKSPACE DANS LA LISTE ET SUPRESSION //
//
//     })
// })
//
//
//
// describe('Securité', () => {
//   it('rediriger vers login.html', function () {
//       ///HTTPS
//       var url = browser.url('/auth/application.html')
//       browser.waitUntil(() => {
//        return $('form').isVisible();
//       }, 5000)
//     })
// })
