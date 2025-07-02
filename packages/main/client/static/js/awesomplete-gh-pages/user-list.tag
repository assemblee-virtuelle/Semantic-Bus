
<user-list>

<input class="awesomplete" list="users-list">
<p>{matches}<p>

<script>
    //load user list
    

    //autocomplete    
     

    this.on('mount', function () {
        RiotControl.trigger('load_all_profil_by_email');
        RiotControl.on('all_profil_by_email_load',function(data){
            var input = document.getElementById("myinput");
            new Awesomplete(input, {
	            list: data
            })     
        })
    })
</script>
<style>
.ui-menu .ui-menu-item a{
    color: blue;
    border-radius: 5px;
    text-align:center;
    margin-left:5%;
    margin-top:100px;
    padding:10px!important;
    
}
#users-list {
   color:blue; border-radius:5px; padding:5px; text-align:center; margin-left:25%; margin-top:10%;width:35%;border:1px solid blue
}
</style>
</user-list>
<!-- $('#users-list').autocomplete({
            source: function( request, response ) {
                var matches = $.map(data , function(user) {
                    if ( user.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
                        return user;
                    }
                });
                response(matches);
            }
        }) -->