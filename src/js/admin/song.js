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
          },
          update(data){
             var song = AV.Object.createWithoutData('Song', this.data.id);
               // 修改属性
               song.set('name', this.data.name)
               song.set('singer', this.data.singer)
               song.set('url', this.data.url)
               // 保存到云端
               return song.save().then((response)=>{
                Object.assign(this.data,data)
                return response
               })
            }
         }
         let controller= {
          init(view,model){
            this.view = view
            this.view.init()
            this.model = model
            this.view.render(this.model.data)
            this.bindEvents()
             window.eventHub.on('select',(data)=>{
               this.model.data = data
              this.view.render(this.model.data)
             })
               window.eventHub.on('new',(data)=>{
                if(this.model.data.id){
                  this.model.data = {        
                  name: '',singer: '',url: '',id: ''
                }
                }else{
                  Object.assign(this.model.data,data)
                }
               
              this.view.render(this.model.data)
             })
          },
          save(){
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
          },
          update(){
                let need = 'name singer url'.split(' ')
                let data = {}
                need.map((str)=>{
                  data[str] = this.view.$el.find(`[name="${str}"]`).val()
                })
                  this.model.update(data)
                  .then(()=>{
                    console.log('更新success')
                    window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data)))
                  })
          },
          bindEvents(){
           this.view.$el.on('submit', 'form', (e)=>{
                e.preventDefault()
                if(this.model.data.id){
                  //console.log('id存在')
                  this.update()
                }else{
                  console.log('id不存在')
                  this.save()
                }

           })
          }
         }
        controller.init(view,model)
       

      //  window.app.songForm = controller
}
