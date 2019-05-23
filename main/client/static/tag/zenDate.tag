<zendate>
  <div if={opts.mode=='read' && opts.riotValue!=undefined}>
    {opts.riotValue.toLocaleString()}
  </div>
  <div if={opts.mode=='edit'}>
    <input type="number" ref="day" value={day} min="0" max= "31" onchange={dateChange}>
    <span>/</span>
    <input type="number" ref="month" value={month} min="0" max= "12" onchange={dateChange}/>
    <span>/</span>
    <input type="number" ref="year" value={year} min="0" onchange={dateChange}/>
    <span> à </span>
    <input type="number" ref="hour" value={hour} min="0" max= "23" onchange={dateChange}/>
    <span>h</span>
    <input type="number" ref="minute" value={minute} min="0" max= "59" onchange={dateChange}/>
    <span>m</span>
    <input type="number" ref="second" value={second} min="0" max= "59" onchange={dateChange}/>
    <span>s</span>
  </div>
  <script>

    this.on('update', function () {
      this.dateValue= opts.riotValue;
      if(this.dateValue!=undefined){
        this.year=this.dateValue.getFullYear();
        this.month=this.dateValue.getMonth()+1;
        this.day=this.dateValue.getDate();
        this.hour=this.dateValue.getHours();
        this.minute=this.dateValue.getMinutes();
        this.second=this.dateValue.getSeconds();
      }

      // allows recalculation of context data before the update
    })

    dateChange(e) {
      let newDate = new Date(this.refs.year.value,this.refs.month.value-1,this.refs.day.value,this.refs.hour.value,this.refs.minute.value,this.refs.second.value);
      this.trigger('dateChanged', newDate)
    }

    this.on('mount', function () {
    });
  </script>
  <style>
  input{
    width:30px;
    text-align: right;
  }
  </style>

</zendate>
