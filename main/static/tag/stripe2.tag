<stripe2-tag style="flex-grow: 1;">
    <div class="containerV" style="overflow-x: hidden;flex-grow: 1;">
        <div class="containerH" style="flex-grow: 1;flex: 1; justify-content:space-around;background:rgb(238, 242, 249)"  if={(payment_error == false) && (payment_done == false)} >
            <div class="containerV" style="overflow-x: hidden;justify-content:center;align-items:center;background:rgb(238, 242, 249);flex: 0.35;">
                <span class="title-payement"> Vous disposez de : </span>
                <span if={profil != null} style="font-size:3em;color:rgb(14,33,89)"> {this.precisionRound((profil.credit),1)} crédits</span>
                <span if={profil != null} style="font-size:2em;color:rgb(141,141,141)">  {this.precisionRound((profil.credit/1000),1)} Euros </span>
                <a href="#profil//transaction" style=
                "border-radius: 25px;
                padding:1em;
                background-color: rgb(9,245,185);
                color: white;
                font-size: 20px;
                margin-top: 20px;
                text-align: center;"> Historique </a>
            </div>
            <div class="containerV" style="overflow-x: hidden;flex: 0.003;justify-content:center;align-items:center">
                <div class="row-vertical"></div>
            </div>
            <div class="containerV" style="overflow-x: hidden;flex: 0.45;justify-content:center">
                <div class="stripeContainer">
                    <div class="stripeSubContainer" style="flex-grow: 1;padding: 2em;">
                        <h3 class="title-payement" style="text-align: left;font-family: 'Open Sans', sans-serif;">Recharger vos crédits </h3>

                        <div class="containerH" style="justify-content:flex-start;">
                            <div class="containerV" style="overflow-x: hidden;align-items: center;margin-top: 0.6em;">
                                <input type='button' value='+'  style="background:white" onclick={plusClick}/>
                                <input type='button' value='-'  style="background:white" onclick={moinsClick}/>
                            </div>
                            <div class="first-infos-payement-block" style="width: 20%">
                                <span class="sub-title-payement">Euros €</span>
                                <input onkeypress='return event.charCode >= 48 && event.charCode <= 57 || event.charCode == 8'
                                onChange={changeValue} value={precisionRound(euros,1)}
                                class="field"
                                />
                            </div>
                            <div class="first-infos-payement-block" style="width: 20%">
                                <span class="sub-title-payement">Crédit</span>
                                <input readonly="readonly"  value={this.precisionRound((euros*1000),1)} class="field"/>
                            </div>
                            <div class="first-infos-payement-block" style="width: 20%">
                                <span class="sub-title-payement">Offre Beta </span>
                                <input readonly="readonly"  value="+ 20%" class="field"/>
                            </div>
                            <div class="first-infos-payement-block" style="width: 20%">
                                <span class="sub-title-payement">Crédit Offert</span>
                                <input readonly="readonly" value={this.precisionRound((euros * 1000 * 0.2), 1)} class="field"/>
                            </div>
                        </div>
                        <div class="containerV" style="overflow-x: hidden;justify-content:flex-start;">
                            <h3 class="title-payement" style="text-align: left;font-family: 'Open Sans', sans-serif;"> Informations de paiement </h3>
                            <div class="first-infos-payement">
                                <form>
                                    <div class="fieldset">
                                        <div class="first-infos-payement-block"
                                                style="width:87%">
                                            <span class="sub-title-payement">Nom du proprietaire</span>
                                            <input
                                                    id="card-proprietaire"
                                                    placeholder="Emma Berger"
                                                    class="field empty first-width"
                                                    ref="name" />
                                        </div>
                                    </div>
                                        <div class="fieldset">
                                            <div class="first-infos-payement-block"
                                                style="width:87%;">
                                            <span class="sub-title-payement">Numéro de carte</span>
                                            <div id="stripeContainer-card-number"
                                                class="field empty first-width">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="fieldset" style="justify-content:baseline">
                                        <div class="first-infos-payement-block"
                                                style="width:25%">
                                            <span class="sub-title-payement"> Expiration </span>
                                            <div id="stripeContainer-card-expiry"
                                                class="field empty second-width">
                                            </div>
                                        </div>
                                        <div class="first-infos-payement-block"
                                                style="width:25%;margin-left:36%">
                                            <span class="sub-title-payement"> CVC </span>
                                            <div id="stripeContainer-card-cvc" class="field empty second-width">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="error"
                                        role="alert"
                                        style="width:100%;margin-top:1em">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            width="17"
                                            height="17"
                                            viewBox="0 0 17 17">
                                        <path class="base"
                                                fill="#000"
                                                d="M8.5,17 C3.80557963,17 0,13.1944204 0,8.5 C0,3.80557963 3.80557963,0 8.5,0 C13.1944204,0 17,3.80557963 17,8.5 C17,13.1944204 13.1944204,17 8.5,17 Z"></path>
                                        <path class="glyph"
                                                fill="#FFF"
                                                d="M8.5,7.29791847 L6.12604076,4.92395924 C5.79409512,4.59201359 5.25590488,4.59201359 4.92395924,4.92395924 C4.59201359,5.25590488 4.59201359,5.79409512 4.92395924,6.12604076 L7.29791847,8.5 L4.92395924,10.8739592 C4.59201359,11.2059049 4.59201359,11.7440951 4.92395924,12.0760408 C5.25590488,12.4079864 5.79409512,12.4079864 6.12604076,12.0760408 L8.5,9.70208153 L10.8739592,12.0760408 C11.2059049,12.4079864 11.7440951,12.4079864 12.0760408,12.0760408 C12.4079864,11.7440951 12.4079864,11.2059049 12.0760408,10.8739592 L9.70208153,8.5 L12.0760408,6.12604076 C12.4079864,5.79409512 12.4079864,5.25590488 12.0760408,4.92395924 C11.7440951,4.59201359 11.2059049,4.59201359 10.8739592,4.92395924 L8.5,7.29791847 L8.5,7.29791847 Z"></path>
                                        </svg>
                                        <span class="message"
                                            style="margin-left:1em"></span>
                                    </div>
                                </form>
                            </div>
                            <div class="containerH" style="justify-content:center;">
                                <button style="padding: 0.6em;
                                    border-radius: 25px;
                                    background-color:rgb(41,177,238);
                                    flex:0.2;
                                    color: white;
                                    font-size: 20px;
                                    margin-top: 20px;
                                    text-align: center;" onclick={addPaiment}>
                                    <img width="20"src="./image/closed-lock.png"/>
                                    Payer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="containerV"style="overflow-x: hidden;justify-content:center;" if={(payment_error == true) && (payment_done == false)}>
            <h3 style="text-align: center;font-family: 'Open Sans', sans-serif;color: rgb(130,130,130);">{error}</h3>
        </div>

        <div class="containerV"style="overflow-x: hidden;justify-content:center;align-items:center;background:white" if={(payment_done == true) && (payment_error == false)}>
            <h3 class="title-payement">
                Payement réalisé avec succés vous beneficier de {credits} credits
            </h3>
            <image class="" src="./image/checked.png" width="50" height="50" />
            <a href="#profil//running"  style="padding: 0.8em;
                                    border-radius: 25px;
                                    background-color:rgb(41,177,238);
                                    color: white;
                                    font-size: 20px;
                                    margin-top: 20px;
                                    text-align: center;
                                    margin-top: 10%;"> Retour </a>
        </div>
    </div>
<script>
    let stripe = Stripe(localStorage.stripe_public_key);
    let cardNumber;
    this.payment_error = false
    this.payment_done = false
    this.euros = 0.50;
    const registerElements = (elements, classN) => {
        if(elements && classN){
            var formClass = '.' + classN;
            var DOM = document.querySelector(formClass);
            var form = DOM.querySelector('form');
            var error = form.querySelector('.error');
            var errorMessage = error.querySelector('.message');

            // Listen for errors from each Element, and show error messages in the UI.
            var savedErrors = {};
            elements.forEach(function (element, idx) {
                element.on('change', function (event) {
                if (event.error) {
                    error.classList.add('visible');
                    savedErrors[idx] = event.error.message;
                    errorMessage.innerText = event.error.message;
                } else {
                    savedErrors[idx] = null;

                    // Loop over the saved errors and find the first one, if any.
                    var nextError = Object.keys(savedErrors)
                    .sort()
                    .reduce(function (maybeFoundError, key) {
                        return maybeFoundError || savedErrors[key];
                    }, null);

                    if (nextError) {
                    // Now that they've fixed the current error, show another one.
                    errorMessage.innerText = nextError;
                    } else {
                    // The user fixed the last error; no more errors.
                    error.classList.remove('visible');
                    }
                }
                });
            });
        }
    };

    const elementClasses = {
        focus: 'focus',
        empty: 'empty',
        invalid: 'invalid',
    };

    const elementStyles = {
        base: {
            color: '#203f6a',

            ':focus': {
            color: '#424770',
            },

            '::placeholder': {
            color: '#9BACC8',
            },

            ':focus::placeholder': {
            color: '#CFD7DF',
            },
        },
        invalid: {
            color: '#fff',
            ':focus': {
            color: '#FA755A',
            },
            '::placeholder': {
            color: '#FFCCA5',
            },
        },
    };

    reloadLoc(){
        location.reload()
    };

    changeValue(e){
        if(parseInt(e.currentTarget.value) && parseInt(e.currentTarget.value) > 0.50){
            this.euros = parseInt(e.currentTarget.value);
            this.update()
        }else{
            this.euros = 0.50
            this.update()
        }
    }.bind(this)

    plusClick(e){
        this.euros += 0.10
        this.update()
    };

    moinsClick(e){
        if(this.euros > 0.50){
            this.euros -= 0.10
            this.update()
        }
    };

    precisionRound(number, precision) {
        var factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
    };

    RiotControl.on('profil_loaded', function (data) {
        console.log("profil loaded", data)
        this.profil = data;
        this.update()
    }.bind(this))

    RiotControl.on('payment_good', function(credits){
        console.log("ON PAYEMENT GOOD")
        this.payment_done = true
        this.payment_error = false
        this.credits = credits
        this.update()
    }.bind(this))

    RiotControl.on('error_payment', function(){
        console.log("ON ERROR PAYMENT")
        this.payment_done = false
        this.payment_error = true
        this.error = "Erreur lors de votre payment, Contactez nous si cela persiste (semanticbusdev@gmail.com)"
        this.update()
    }.bind(this))


    RiotControl.on('user_no_validate', function(){
        this.payment_done = false
        this.payment_error = true
        this.error = "Votre compte n'est pas validé, veuillez le valider avant de recharger vos credits"
        this.update()
    }.bind(this))


    this.on('mount', function () {
        this.refs.name.addEventListener('change', function (e) {
            this.name = e.currentTarget.value;
        }.bind(this));
        addPaiment(){
            console.log(this.name)
            let formClass = '.stripeContainer'
            let DOM = document.querySelector(formClass)
            let form = DOM.querySelector('form')
            let error = form.querySelector('.error')
            let errorMessage = error.querySelector('.message')
            if (this.name && this.name.match(/^(?=.{2,20}$)([a-z-A-Z]+( )*[a-z-A-Z]+)+$/)) {
                stripe.createSource(cardNumber).then(function(result) {
                    if (result.error) {
                    // Inform the user if there was an error
                    console.log("TOKEN ERR", result.error)
                    var errorElement = document.getElementById('card-errors');
                    errorElement.textContent = result.error.message;
                    }else {
                        console.log("TOKEN ERR", result.source)
                        RiotControl.trigger('init_stripe_user',{card:result.source, amout: this.precisionRound((this.euros * 1000), 1)});
                    }
                }.bind(this));
            } else {
                error.classList.add('visible')
                errorMessage.innerText = 'Entrez un nom valide'
            }
        }
        RiotControl.on('payment_init_done', (source)=>{
            window.open(source.redirect.url,'_self');
        })
        RiotControl.trigger('load_profil');
        let elements = stripe.elements({
            fonts: [
                {
                cssSrc: 'https://fonts.googleapis.com/css?family=Quicksand',
                }
            ],
            locale: window.__exampleLocale
        })
        let cardExpiry = elements.create('cardExpiry', {
            style: this.elementStyles,
            classes: this.elementClasses
        })
        cardExpiry.mount('#stripeContainer-card-expiry')

        cardNumber = elements.create('cardNumber', {
            style: this.elementStyles,
            classes: this.elementClasses
        })
        cardNumber.mount('#stripeContainer-card-number')

        let cardCvc = elements.create('cardCvc', {
            style: elementStyles,
            classes: elementClasses
        })
        cardCvc.mount('#stripeContainer-card-cvc')

        registerElements([cardExpiry, cardNumber, cardCvc], 'stripeContainer')
    })
</script>
<style>


    .title-payement {
        color:rgb(33,151,242)
    }

    .sub-title-payement {
        color:rgb(124,124,124);
        font-size:0.6em
    }

    .first-infos-payement-block {
        display: flex;
        flex-direction: column;
    }

    /* UTILS  */

    .title-payement-loader {
        font-family: 'Gotham Rounded Medium';
        font-size: 3rem;
        color: #2ad2b6;
        text-align: center;
        margin-top: 1em;
        margin-bottom: 1em;
    }
    .loaderPayment {
        display: -ms-flexbox;
        display: flex;
        -ms-flex-direction: column;
        flex-direction: column;
        -ms-flex-align: center;
        align-items: center;
        -ms-flex-pack: center;
        justify-content: center;
        position: absolute;
        width: 100%;
        height: 100%;
        background:#203f6a;
        top: 0;
        left: 0;
        padding: 10px;
        text-align: center;
        pointer-events: none;
        overflow: hidden;
    }
    /*-------------- */

    /* row dashed */

    .row-vertical {
        border: 0.7px solid #e8ebf0;
        border-style: dashed;
        flex:0.3;
    }

    /*-------------- */

    /* Stripe element CSS */

    .first-payment-stripe {
        flex:0.5
    }
    .second-payment-stripe {
        flex:0.5
    }
    .stripeSubContainer {

        flex-direction:column;
        background-color: white;
        flex:0.5
    }
    .stripeContainer {
        justify-content:center;
        flex-direction:column;
        background-color: white;
    }
    .stripeContainer form {
        width:100%
    }
    .stripeContainer .fieldset {
        padding: 0;
        border-style: none;
        display: flex;
        justify-content: space-between;
        margin-bottom:1em;
    }
    .stripeContainer .field {
        background-color: #f4f5f7;
        border-radius: 3rem;
        padding: 10px 20px 11px;
        border:1px solid white
    }

    .stripeContainer .field.StripeElement--invalid {
        background-color: #fa755a;
    }
    .stripeContainer .field.StripeElement--invalid.focus {
        color:white;
    }
    .stripeContainer .field.invalid {
        background-color: #fa755a;
    }
    .stripeContainer .field.invalid.focus {
        background-color: #f6f9fc;
    }

    .stripeContainer input, .stripeContainer button {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        outline: none;
        border-style: none;
    }
    .stripeContainer input {
        color: #203f6a;
    }

    /*-------------- */

    /* Error  css */

    .visible {
        opacity: 1!important;
    }
    .error {
        width: 100%;
        font-size: 1em !important;
        opacity: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .stripeContainer .error svg .base {
        fill: #fa755a;
    }
    .stripeContainer .error svg .glyph {
        fill: #fff;
    }
    .stripeContainer .error .message {
        color: #203f6a;
    }

    /*-------------- */
</style>
</stripe2-tag>
