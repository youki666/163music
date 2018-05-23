{
  let view = {
    el:'.songList-container',
    template: `
              <ul class='songList'>
                </ul>
    `,
      render(data){
        let $el = $(this.el)
         $el.html(this.template)
         let {songs} = data
         let liList = songs.map((song)=>{
              let $li = $('<li></li>').text(song.name).attr('data-id',song.id)
             return $li
         })
         $el.find('ul').empty()
         liList.map((domLi)=>{
          $el.find('ul').append(domLi)
         })
    
   },
    activeItem(li){
              let $li = $(li)
                $li.addClass('active')
                    .siblings('.active').removeClass('active')

    },
   clearActive(){
       $(this.el).find('.active').removeClass('active')
   }
  }
         let model = {
          data:{
            songs:[]
          },
          find(){
              var userQuery = new AV.Query('Song');
              return userQuery.find().then((songs)=>{
                 this.data.songs = songs.map((song)=>{
                  return {id:song.id,...song.attributes}
                 })
                 return songs
              })
          }
         }
         let controller= {
          init(view,model){
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.getAllsongs()
            this.bindEventhub()
            this.bindEvents()     
          },
          getAllsongs(){
               this.model.find().then(()=>{
                //console.log('this.model.data')
                console.log(this.model.data)
                this.view.render(this.model.data)
              })
          },
          bindEvents(){
              $(this.view.el).on('click','li',(e)=>{
                this.view.activeItem(e.currentTarget)
                let songId = e.currentTarget.getAttribute("data-id")
                 let data
                 let songs =this.model.data.songs
                 for(let i = 0; i<songs.length; i++){
                if(songs[i].id === songId){
                  data = songs[i]
                   break
           }
        }
             // console.log(data)
               window.eventHub.emit('select',JSON.parse(JSON.stringify(data))) 
              })
          },
          bindEventhub(){
             window.eventHub.on('upload',(data)=>{
              console.log('songList模块 得到了data')
             this.view.clearActive()
            })
              window.eventHub.on('create',(songData)=>{
                this.model.data.songs.push(songData)
                 this.view.render(this.model.data)
              })
             window.eventHub.on('new',()=>{
                this.view.clearActive()
             })  
          }
         }
        controller.init(view,model)
       // window.app.songList = controller
}
