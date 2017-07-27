
'use strict'
const assert = require('assert');

///WS1 SCENARIO DE TEST ////

describe('Parcour complet creation d\'un workspace et ajout d\'un composant', () => {
  it('on devrait arriver sur la listes des worksapces avec notre workspace crée', function () {   
      ///CONNEXION 
      var url = browser.url('/auth/login.html')    
      browser.waitUntil(() => {
       return $('form').isVisible();
      }, 5000)
      let email = 'input[name="email"]';
      browser.waitForVisible(email,3000);
      browser.setValue(email, 'alexbocenty@hotmail.fr')
      let password = 'input[name="password"]';
      browser.setValue(password, 'azerty')
      $('#btn2').click();
      expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/ihm/application.html');
      browser.waitForVisible('navigation');
      let workSpaceSelector = 'div[name="workspaceSelector"]';
      browser.waitForVisible(workSpaceSelector,3000);

      // ACCES LISTE WORKSPACE
      $(workSpaceSelector).click();
      browser.waitForVisible('workspace-table');
  
      // MODE AJOUT D'UN WORKSPACE //(edit mode de base quand on creer un workspace)
      $('zentable').$('div.commandButton').click()
      browser.waitForVisible('workspace-editor');
   
      // AJOUT D'UN  COMPONENT //
      $('zentable').$('div.commandButton').click();
      browser.waitForVisible('technical-component-table');
      $('technical-component-table').$('zentable').$('div[name="tableBody"]').click();
      browser.waitForVisible('workspace-editor');
      // AJOUT D'UN USER

      //DEPLACEMENT SUR LE MENU USER
      browser.waitUntil(() => {
         if(browser.isVisible('#containerloaderDiv') == false){
           return true
          };
      }, 50000, 'le loader doit avoir disparue')
      
      $('workspace-editor').$('div.white').click()

      // EDIT MODE //
      $('workspace-editor').$('div.commandButton').click()

      // CLICK SUR PLUS //
      browser.waitForVisible('zentable');
      $('#userliste').$('div.commandButton').click();
      
      /// REMPLISSAGE LIST USER ///
      browser.waitForVisible('user-list');
      browser.setValue('#users-list', 'semanticbusdev@gmail.com')

      /// PARTAGE DU WORKSPACE 
      $('user-list').$('.share-btn').click()
      $('#cancel').click()

      //ADD DESCRIPTION
      $('#backBar').click()
    })  
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




