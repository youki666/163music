{
  let view = {
    el: '#loading',
    show(){
      $(this.el).addClass('active')
    },
    hide(){
      $(this.el).removeClass('active')
    },
  }
  let controller = {
    init(view){
      this.view = view
      this.bindEventHub()
    },
    bindEventHub(){
      window.eventHub.on('BeforeUpload', ()=>{
        this.view.show()
      })
      window.eventHub.on('AfterUpload', ()=>{
        this.view.hide()
      })
    }
  }
  controller.init(view)
}