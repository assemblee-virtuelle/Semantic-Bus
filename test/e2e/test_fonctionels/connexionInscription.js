


describe('workspaces and components ', () => {
    it('connexion', function() {
        var url = browser.url('/auth/login.html')
        let email = '#email';
        browser.waitForVisible(email);
        browser.setValue(email, 'alexfoot32@orange.fr')
        let password = '#password';
        browser.setValue(password, 'azerty')
        //$('#btn2').click();
        browser.click('#btn2');
        browser.waitForVisible('.containerV', 10000);
        //expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/ihm/application.html');
        //token = browser.localStorage('GET', 'token').value;
    })
    it('inscription', function() {
        var url = browser.url('/auth/login.html')
        let inscriptionBtn = '.btn';
        browser.waitForVisible(inscriptionBtn);
        browser.click(inscriptionBtn);
        let emailInscription = '#test-emailInscription';
        browser.waitForVisible(emailInscription);
        browser.setValue(emailInscription, 'alextesteur2@orange.fr')
        let confirmePasswordInscription= '#test-confirmepasswordInscription';
        browser.setValue(confirmePasswordInscription, 'azerty')
        let passwordInscription = '#test-passwordInscription';
        browser.setValue(passwordInscription, 'azerty')
        let job = '#test-jobInscription'
        browser.setValue(job, 'developpeur')
        let societe = '#test-societeInscription'
        browser.setValue(societe, 'data players')
        let name = '#test-nameInscription'
        browser.setValue(name, 'dataPlayersTesteur')
        //$('#btn2').click();
        browser.click('#btn4');
        browser.waitForVisible('.containerV', 10000);
        //expect(browser.getUrl()).to.be.equal('http://app-9cd7b697-3708-49fe-a478-7ed223d0aa11.cleverapps.io/ihm/application.html');
        //token = browser.localStorage('GET', 'token').value;
    })
    it('connexion google', function() {
        ///CONNEXION
        var url = browser.url('/auth/login.html')
        let btnGoogle = '#btn-google';
        browser.waitForVisible(btnGoogle);
        browser.click(btnGoogle);
        let googleCompte = '#identifierId'
        browser.waitForVisible(googleCompte, 10000);
        browser.setValue(googleCompte, 'semanticbusdev@gmail.com')
        browser.click('.RveJvd.snByac');
        let passwordGoogle = '#password .whsOnd.zHQkBf'
        browser.waitForVisible(passwordGoogle, 10000);
        browser.setValue(passwordGoogle, 'semanticbus')
        browser.click('.RveJvd.snByac');
        browser.waitForVisible('.containerV', 15000);
    })

    it('local storage test', function(){
        browser.localStorage('POST', {key: "token", value: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDU3MDg5NDksImlhdCI6MTUwNDQ5OTM0OSwiaXNzIjoiNTk0NDY0OWExMDQxYzEwMDIxZjk3NzIyIn0.-Lb1hUSM1PIrH12BM53uysPtn5Vu2IR1Lvnq7EsNTjg"});
        var url = browser.url('/ihm/application.html')
        // browser.waitForVisible('navigation', 10000);
        let email = '#email';
        browser.waitForVisible(email);
        browser.setValue(email, 'alexfoot32@orange.fr')
        let password = '#password';
        browser.setValue(password, 'azerty')
        //$('#btn2').click();
        browser.click('#btn2');
        browser.waitForVisible('.containerV', 10000);
    })
})
