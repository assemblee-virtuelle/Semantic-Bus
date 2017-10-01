
'use strict'
const assert = require('assert');

///WS1 SCENARIO DE TEST ////
var token;
describe('Parcour complet creation d\'un workspace et ajout d\'un composant', () => {
  it('connexion', function () {
      ///CONNEXION
      //const title = browser.url('https://developer.mozilla.org/en-US/').getTitle()
      //assert.equal(title, 'MDN Web Docs');
      //var page = browser.url('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/auth/login.html');
      var page = browser.url('http://localhost:8080/auth/login.html');
      assert.equal(page.getTitle(), 'Bus Sémantique');
    //  expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/auth/login.html');
    //expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/ihm/application.html');
   //browser.waitForVisible('#test',5000);
    //  browser.waitUntil(() => {
    //   return $('#test').isVisible();
    // }, 5000);
  //   browser.waitUntil(() => {
  //     var html =browser.getHTML('body');
  //     console.log('body |',html);
  //    return $('#test2').isVisible();
  //  }, 5000);

      browser.waitUntil(() => {
        //console.log(browser.getHTML('#test'));
        var logs=browser.log('browser');
        console.log(logs);
       return $('login').isVisible();
     }, 5000);

    //   let email = 'input[name="email"]';
    //   browser.waitForVisible(email,5000);
    //   browser.setValue(email, 'alexfoot32@orange.fr')
    //   let password = 'input[name="password"]';
    //   browser.setValue(password, 'azerty')
    //   $('#btn2').click();
    //   browser.waitForVisible('navigation',5000);
    //   //expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/ihm/application.html');
    //   token = browser.localStorage('GET', 'token').value;

    })
    // it('affichages wokspaces', function () {
    //
    //
    //     browser.waitForVisible('navigation');
    //     let workSpaceSelector = '#workspaceSelector';
    //     browser.waitForVisible(workSpaceSelector,10000);
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
})

describe('test storage', () => {
  // it('set storage', function () {
  //     console.log('set',token);
  //     //expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/ihm/application.html');
  //
  // })
})



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

//       // ACCES LISTE WORKSPACE
//       $(workSpaceSelector).click();
//       browser.waitForVisible('workspace-table');

//       // SELECTION D'UN WORKSPACE DANS LA LISTE ET SUPRESSION //



//     })
// })




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

//       // ACCES LISTE WORKSPACE
//       $(workSpaceSelector).click();
//       browser.waitForVisible('workspace-table');

//       // SELECTION D'UN WORKSPACE DANS LA LISTE ET SUPRESSION //

//     })
// })




// describe('deconnexion', () => {
//   it('on devrait arriver sur login.html, function () {
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

//       // ACCES LISTE WORKSPACE
//       $(workSpaceSelector).click();
//       browser.waitForVisible('workspace-table');

//       // SELECTION D'UN WORKSPACE DANS LA LISTE ET SUPRESSION //

//     })
// })




// describe('modification email', () => {
//   it('on devrait voir son email modifier, function () {
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

//       // ACCES LISTE WORKSPACE
//       $(workSpaceSelector).click();
//       browser.waitForVisible('workspace-table');

//       // SELECTION D'UN WORKSPACE DANS LA LISTE ET SUPRESSION //

//     })
// })


// describe('tester un workspace', () => {
//   it('on devrait voir le flux tiré, function () {
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

//       // ACCES LISTE WORKSPACE
//       $(workSpaceSelector).click();
//       browser.waitForVisible('workspace-table');

//       // SELECTION D'UN WORKSPACE DANS LA LISTE ET SUPRESSION //

//     })
// })



// describe('Securité', () => {
//   it('rediriger vers login.html', function () {
//       ///HTTPS
//       var url = browser.url('/auth/application.html')
//       browser.waitUntil(() => {
//        return $('form').isVisible();
//       }, 5000)
//     })
// })
