{
  let view = {
    el:'.page > main',
    init(){
      this.$el = $(this.el)  
    },
    template: `
              

               <form  class='form'>
                   <div class="row">
                        <label >歌名
                          <input  name='name' type="text" value='__name__' >
                        </label>
                   </div>
                   <div class="row">
                        <label >歌手
                          <input name="singer" type="text" value='__singer__'>
                        </label>
                   </div>
                   <div class="row">
                        <label >外链
                          <input name = "url" type="text" value='__url__'>
                        </label>
                   </div>
                   <div class="row">
                        <button type='submit'>保存</button>
                   </div>
               </form>
    `,
      render(data = {}){
        let placeholders = ['name','singer','url','id']
        let html = this.template
        placeholders.map((str)=>{
          html = html.replace(`__${str}__`, data[str] || '')
        })
    $(this.el).html(html)
    if(data.id){
      $(this.el).prepend('<h1>编辑歌曲</h1>')
    }else{
      $(this.el).prepend('<h1>新建歌曲</h1>')
    }
   },
   reset(){
    this.render({})
   }
  }
         let model = {
          data:{
            name: '',singer: '',url: '',id: ''
          },
         create(data){
      
             var Song = AV.Object.extend('Song');
             // 新建对象
             var song = new Song();
             // 设置名称
             song.set('name',data.name);
             song.set('singer',data.singer);
             song.set('url',data.url);
             return song.save().then((newSong)=> {
               //console.log(newSong);
               let {id,attributes} = newSong
               Object.assign(this.data,{id,...attributes})
             },  (error)=> {
               console.error(error);
             });
          }
         }
         let controller= {
          init(view,model){
            this.view = view
            this.view.init()
            this.model = model
            this.view.render(this.model.data)
            this.bindEvents()
             window.eventHub.on('upload',(data)=>{
              console.log('songForm模块 得到了data')
              this.model.data = data
            this.view.render(data)
            })
             window.eventHub.on('select',(data)=>{
               this.model.data = data
              this.view.render(this.model.data)
             })
               window.eventHub.on('new',(data)=>{
               this.model.data = { }
              this.view.render(this.model.data)
             })
          },
          bindEvents(){
           this.view.$el.on('submit', 'form', (e)=>{
                e.preventDefault()
                let need = 'name singer url id'.split(' ')
                let data = {}
                need.map((str)=>{
                  data[str] = this.view.$el.find(`[name="${str}"]`).val()
                })
                 
                this.model.create(data)
                 .then(()=>{
                   console.log(this.model.data)
                   this.view.reset()
                   
                   window.eventHub.emit('create', JSON.parse(JSON.stringify(this.model.data)))
                   
                 }) 
           })
          }
         }
        controller.init(view,model)
       

      //  window.app.songForm = controller
}
