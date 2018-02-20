<stripe-tag>
    <div class="containerV"style="justify-content:center;align-items: center;" if={(payment_error == false) && (payment_done == false)}>
        <h3 style="text-align: center;font-family: 'Open Sans', sans-serif;color: rgb(130,130,130);">Combien de credits voulez vous recharger ? </h3>
        <div class="containerH">
            <div class="containerV" style="justify-content:center;padding:20px;align-items: center;">
                <image class="" src="./image/plus.png" style="margin-bottom:10px" width="30" height="30" onclick={plusClick}></image>
                <image class="" src="./image/moins.png" width="30" height="30" onclick={moinsClick}></image>
            </div>
            <input onkeypress='return event.charCode >= 48 && event.charCode <= 57 || event.charCode == 8' onChange={changeValue} value={this.precisionRound(euros,1) + " €"} style="width: 30%;display: flex;
        border-radius: 5px;
        height: 10vh;
        font-size: 40px;
        text-align:center;
        color:rgb(100,100,100);"/>
            <div style="justify-content:center;align-items:center;display:flex">
            <h4 style="margin-left:30px;text-align: center;font-family: 'Open Sans', sans-serif;color: rgb(130,130,130);">
                    = {this.precisionRound((euros*1000),1)} crédits + {this.precisionRound((euros * 1000 * 0.2), 1)}  offert pendant la Beta Test
            </h4>
            </div>
        </div>
        <h5 style="text-align: center;font-family: 'Open Sans', sans-serif;color: rgb(130,130,130);">
            Carte de credit
        </h5>
        <div id="payment-form" onclick={validatePayement} style="display: flex;flex-direction: column;">
            <div class="form-row">
                <div id="card-element">
                <!-- a Stripe Element will be inserted here. -->
                </div>

                <!-- Used to display form errors -->
                <div id="card-errors" role="alert"></div>
            </div>
            <button style="padding: 20px;
                border-radius: 10px;
                background-color: rgb(33,150,243);
                color: white;
                font-size: 20px;
                margin-top: 20px;
                text-align: center;" onclick={addPaiment}>Confirmer paiement</button>
                <h3 style="text-align: center;font-family: 'Open Sans', sans-serif;color: rgb(130,130,130);">
                    Offre de 20% de crédit pendant la beta Test
                </h3>
                
        </div>
    </div>
    <div class="containerV"style="justify-content:center;" if={(payment_error == true) && (payment_done == false)}>
        <h3 style="text-align: center;font-family: 'Open Sans', sans-serif;color: rgb(130,130,130);">{error}</h3>
    </div>

    <div class="containerV"style="justify-content:center; align-items:center" if={(payment_done == true) && (payment_error == false)}>
        <h3 style="text-align: center;font-family: 'Open Sans', sans-serif;color: rgb(130,130,130);">
            Payement réalisé avec succés vous beneficier de {credits} credits
        </h3>
        <image class="" src="./image/checked.png" width="50" height="50" ></image>  
    </div>

    <script>
        var stripe = Stripe(localStorage.stripe_public_key);
       

        plusClick(e){
            this.euros += 0.10
            this.update()
        }
        moinsClick(e){
            if(this.euros > 0.50){
                this.euros -= 0.10
                this.update()
            }
        }

        precisionRound(number, precision) {
            var factor = Math.pow(10, precision);
            return Math.round(number * factor) / factor;
        }



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
         
        changeValue(e){
            if(parseInt(e.currentTarget.value) && parseInt(e.currentTarget.value) > 0.50){
                console.log("in if", e.currentTarget.value)
                this.euros = parseInt(e.currentTarget.value);
                 this.update()
            }else{
                console.log("in else", e.currentTarget.value)
                this.euros = 0.50   
                 this.update()
            }
        }.bind(this) 
        this.payment_error = false
        this.payment_done = false


        this.on('mount', function () {     
  
            this.euros = 0.50
            var elements = stripe.elements();
            var style = {
                base: {
                    color: '#32325d',
                    lineHeight: '18px',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                    color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            };

            // Create an instance of the card Element
            var card = elements.create('card', {style: style});

            // Add an instance of the card Element into the `card-element` <div>
            card.mount('#card-element');

            // Handle real-time validation errors from the card Element.
            card.addEventListener('change', function(event) {
            var displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
            });

            addPaiment(){
                console.log("ADD PAYYEMENT", this.precisionRound((this.euros * 1000), 1))
                stripe.createSource(card).then(function(result) {
                    console.log(result.source)
                    if (result.error) {
                    // Inform the user if there was an error
                    var errorElement = document.getElementById('card-errors');
                    errorElement.textContent = result.error.message;
                    }else {
                        RiotControl.trigger('init_stripe_user',{card:result.source, amout: this.precisionRound((this.euros * 1000), 1)});
                    }
                }.bind(this));
            }



            RiotControl.on('payment_init_done', (source)=>{
                window.open(source.redirect.url,'_self');
            })
            this.update()
    });
    </script>

    <style>

        .StripeElement {
            width: 50vh;
            background-color: white;
            height: 40px;
            padding: 10px 12px;
            border-radius: 4px;
            border: 1px solid transparent;
            box-shadow: 0 1px 3px 0 #e6ebf1;
            -webkit-transition: box-shadow 150ms ease;
            transition: box-shadow 150ms ease;
        }

        .StripeElement--focus {
        box-shadow: 0 1px 3px 0 #cfd7df;
        }

        .StripeElement--invalid {
        border-color: #fa755a;
        }

        .StripeElement--webkit-autofill {
        background-color: #fefde5 !important;
        }
    </style>
</stripe-tag>


<!--  
 stripe.createToken(card).then(function(result) {
    console.log(result)
    if (result.error) {
    // Inform the user if there was an error
    var errorElement = document.getElementById('card-errors');
    errorElement.textContent = result.error.message;
    } else {
    // Send the token to your server
    if(this.credits >= 500){
        RiotControl.trigger('stripe_payment',{card:result.token, amout:this.credits});
    }
                    }
                }.bind(this));  -->


                 <!--  else if(result.source.card.three_d_secure == "required" || result.source.card.three_d_secure == "optional" ) {
                        stripe.createSource({
                            type: 'three_d_secure',
                            amount: this.credits,
                            currency: "eur",
                            three_d_secure: {
                                card: result.source.id
                            },
                            redirect: {
                                return_url: "http://localhost:8080/ihm/application.html#profil//payement"
                            }
                        }).then(function(result) {
                            console.log("3D secure", result)
                            if (result.error) {
                                // Inform the user if there was an error
                                var errorElement = document.getElementById('card-errors');
                                errorElement.textContent = result.error.message;
                            }
                            else{
                                window.open(result.source.redirect.url)
                            }
                        }.bind(this));
                    }  -->