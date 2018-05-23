{
  let view = {
    el:'.newSong',
    template: `
              新建歌曲
    `,
      render(data){
    $(this.el).html(this.template)
   }
  }
         let model = {}
         let controller= {
          init(view,model){
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.active()
            window.eventHub.on('upload',(data)=>{
              console.log('newSong模块 得到了data')
              console.log(data)
              this.active()
            })
            window.eventHub.on('select',(data)=>{
              console.log(data.id)
              this.deactive()
            })
            $(this.view.el).on('click',this.active.bind(this))
          },
          active(){
            $(this.view.el).addClass('active')
            window.eventHub.emit('new')
          },
          deactive(){
            $(this.view.el).removeClass('active')
          }
         }
        controller.init(view,model)
       // window.app.newSong = controller

}
