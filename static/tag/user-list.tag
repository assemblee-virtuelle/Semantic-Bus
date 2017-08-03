<user-list>
    <div class="flex-container">
        <h3 class="title-user-list">Membres</h3>
        <input id="users-list" class="awesomplete"  placeholder="entrez un email..." value="{email}">
        <a class="share-btn" onclick={share}>Partager</a>
        <p class="text-user-list">{resultShare}<p>
        <p class="text-user-list">Saisissez une adresse e-mail pour partager votre Workspace<p>
    </div>
    <script>
        this.resultShare = ""

        RiotControl.on('share_change_no_valide', function(){
            this.resultShare = "Aucun utilisateur trouvé";
            this.update();
        }.bind(this)) 

        RiotControl.on('share_change_already', function(){
            this.resultShare = "Workspace déjà partagé";
            this.update();
        }.bind(this)) 
        

        RiotControl.on('share_change', function(data){
            this.resultShare = "Votre workspace a été partagé";
            this.update();
            data = null;
        }.bind(this)) 

        

        RiotControl.on('share_change_send', function(){
            this.resultShare = "Envoie en cour";
            this.update();
        }.bind(this)) 

        share(e){
             //RiotControl.trigger('workspace_current_edit'); 
            RiotControl.trigger('share-workspace', {email:this.email, worksapce_id: this.workspace._id.$oid});
        }
        
        this.on('mount', function () {
            this.email = "";   
            RiotControl.on('workspace_current_changed',function(data){
                this.workspace = data
            }.bind(this));
            RiotControl.trigger('load_all_profil_by_email');
            RiotControl.on('all_profil_by_email_load',function(data){
                console.log(data)
                var input = document.getElementById("users-list");
                var awesomplete = new Awesomplete(input);
                awesomplete.list =  data  
            })
            $('#users-list').on('change',function(e){
                this.email =e.currentTarget.value;
                
            }.bind(this));
        })
    </script>
    <style scoped>



    .share-btn {
        color: white;
        background-color: #3883fa;
        border: none;
        padding: 10px;
        border-radius: 5px 5px 5px 5px;
        text-align: center;
        max-width: 25%;
        margin-top: 10vh;
        margin-left: 39%;
    }
    .text-user-list {
        margin-top: 20vh;
        color: rgb(200,200,200);
    }
    .flex-container {
        display: flex;
        flex-direction: column; 
        text-align: center;
    }
    .title-user-list{
        text-align:center;width: 100%;
        background-color: #3883fa;
        color: white;
        padding: 5vh;
    }
    .ui-menu .ui-menu-item a{
        color: #3883fa;
        border-radius: 5px;
        text-align:center;
        margin-left:5%;
        margin-top:100px;
        padding:10px!important;
    }

    .awesomplete > ul > li {
        position: relative;
        padding: 20px;
        cursor: pointer;
    }

    .awesomplete > ul {
        border-radius: .3em;
        background:white!important;
        border: none!important;
        box-shadow: none!important;
        text-shadow: none;
    }

    .awesomplete mark {
        background: #3883fa;
    }
    mark {
        background: #3883fa;
        color: white;
    }

    .awesomplete > ul {
        position: absolute;
        left: 0;
        z-index: 1;
        min-width: 100%;
        box-sizing: border-box;
        list-style: none;
        padding: 0;
        background: #fff;
        text-align: center;
    }

    .awesomplete {
        display: inline!important;
        position: relative;
    }
    #users-list {
        color: #3883fa;
        border-radius: 5px;
        padding: 5px;
        text-align: center;
        flex:2;
        width: 60%;
        border: 1px solid #3883fa;
        margin-top: 10vh;
    }
    </style>
</user-list>