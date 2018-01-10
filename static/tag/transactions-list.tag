
<transactions-list class="containerV" style="flex-grow:1">
    
    
    <h3 style="text-align: center;font-family: 'Open Sans', sans-serif;color: rgb(130,130,130);">Listes de vos transactions</h3>
    <zenTable class="containerH" style="flex-grow:1" drag={false} disallowselect={true} disallowdelete={true} disallownavigation={true}>
        <yield to="header">
            <div>Identifiant</div>
            <div>Montant ( credit )</div>
            <div>Date</div>
        </yield>
        <yield to="row">
        <div style="width:33%" >{id}</div>
        <div style="width:33%">{amount}</div>
        <div style="width:33%">{date}</div>
        </yield>
    </zenTable>

    <script>


        this.refreshZenTable = function (data) {
            console.log("refreshZenTable", data)
            this.tags.zentable.data = data;
            this.update();
        }.bind(this);
       
        this.on('mount', function () { 
            RiotControl.trigger('load_transactions'); 

             RiotControl.on('list_transaction_load',(data)=>{
                 this.refreshZenTable(data)
            })   
        })
        
    </script>
  
        
</transactions-list>