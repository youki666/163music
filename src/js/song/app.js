{
  let view = {
    el:'#app',

    render(data){
      let {song, status} = data
      $(this.el).css('background-image',`url(${song.cover})`)
      $(this.el).find('img.cover').attr('src',song.cover)
      if($(this.el).find('audio').attr('src') !== song.url){

     let audio = $(this.el).find('audio').attr('src',song.url).get(0)
      audio.onended = ()=>{ window.eventHub.emit('songEnded')}
      audio.ontimeupdate =() =>{
         
         this.showLyric(audio.currentTime)
      }
      }
      $(this.el).on('click','.icon-left',()=>{
            window.eventHub.emit('pre')
      })
      $(this.el).on('click','.icon-right',()=>{
            window.eventHub.emit('next')
      })
     
      if(status =='playing'){
        $(this.el).find('.disc-container').addClass('playing')
        $(this.el).find('.icon-wrapper1').addClass('playing')
      }else{
        $(this.el).find('.disc-container').removeClass('playing')
        $(this.el).find('.icon-wrapper1').removeClass('playing')
      }
       $(this.el).find('.song-description > h1').text(song.name)

       let {lyrics} = song
       lyrics.split('\n').map((str)=>{
        let p =document.createElement('p');
         let reg = /\[([\d:.]+)\](.+)/
         let matches =str.match(reg)
           if(matches){
            p.textContent = matches[2]
          let time = matches[1]
          let parts = time.split(':')
          let minutes = parts[0]
          let seconds = parts[1]
          let newTime = parseInt(minutes,10) * 60 + parseFloat(seconds,10)
          p.setAttribute('data-time', newTime)
           }else{
            p.textContent = str
           }
        $(this.el).find('.lyric > .lines').append(p)
       })  
    },
       showLyric(time){
      let allP = $(this.el).find('.lyric>.lines>p')
      let p 
      for(let i =0;i<allP.length;i++){
        if(i===allP.length-1){
          p = allP[i]
          break
        }else{
          let currentTime = allP.eq(i).attr('data-time')
          let nextTime = allP.eq(i+1).attr('data-time')
          if(currentTime <= time && time < nextTime){
            p = allP[i]
            break
          }
        }
      }
      let pHeight = p.getBoundingClientRect().top
      let linesHeight = $(this.el).find('.lyric>.lines')[0].getBoundingClientRect().top
      let height = pHeight - linesHeight
      $(this.el).find('.lyric>.lines').css({
        transform: `translateY(${- (height - 25)}px)`
      })
      $(p).addClass('active').siblings('.active').removeClass('active')
    },

    play(){
      $(this.el).find('audio')[0].play()
    },
     paused(){
      $(this.el).find('audio')[0].pause()
    }
  }

  let model ={
    data:{
      song:{
        id:'',
      name:'',
      singer:'',
      url:''},
      songs :{},
      songList:[],
      status: 'paused'
    },
    getId(id){
      var query = new AV.Query('Song');
      return query.get(id).then((song) =>{
        Object.assign(this.data.song,{id: song.id, ...song.attributes})
       
        return song
      })
     },
    find(){
      var query = new AV.Query('Song');
      return query.find().then((songs)=>{
        this.data.songs = songs.map((song)=>{
          return {id: song.id, ...song.attributes}
        })
        console.log(songs)
        return songs
      })
    }
    }

  let controller = {
    init(view,model){
      this.view = view
      this.model = model
      let id  = this.getSongid()
      this.model.getId(id).then((data)=>{

         console.log( this.model.data.song.id)
         this.view.render(this.model.data)
         //this.view.play()
      })
      this.model.find().then(()=>{
          for(let i =0;i<this.model.data.songs.length;i++){
          songList[i] = this.model.data.songs[i].id
        }
        this.view.render(this.model.data)
      })
      this.bindEvents()
    },
    bindEvents(){
      $(this.view.el).on('click','.icon-play',()=>{
        this.model.data.status = 'playing'
        this.view.render(this.model.data)
        this.view.play()
      })
      $(this.view.el).on('click','.icon-pause',()=>{
        this.model.data.status = 'paused'
        this.view.render(this.model.data)
        this.view.paused()
      })
       
      window.eventHub.on('songEnded',()=>{
        this.model.data.status = 'paused'
        this.view.render(this.model.data)
      })
      window.eventHub.on('pre',()=>{
    
        let songList = [];
        for(let i =0;i<this.model.data.songs.length;i++){
          songList[i] = this.model.data.songs[i].id
        }
        //alert(songList)
        for(let i=0;i<songList.length;i++){
             if(this.model.data.song.id===songList[i]){
             window.location.search = "?id="+songList[i-1]
            if(this.getSongid()===songList[0]){
              let num = songList['length']-1
              window.location.search = "?id="+songList[num]
            }
            
           }
        }
         this.view.play()
      })
      window.eventHub.on('next',()=>{
         let songList = [];
        for(let i =0;i<this.model.data.songs.length;i++){
          songList[i] = this.model.data.songs[i].id
        }
        console.log(songList)
        for(let i=0;i<songList.length;i++){
             if(this.model.data.song.id===songList[i]){
             window.location.search = "?id="+songList[i+1]
              let num = songList['length']-1
            if(this.getSongid()===songList[num]){
              window.location.search = "?id="+songList[0]
            }
            
            //window.location.search = "?id="+songList[4]
            
           }
        }
      })
    },
    getSongid(){
      let search = window.location.search
           
     if(search.indexOf('?')===0){
    search = search.substring(1)
  }
  let id ='';
  let arr = search.split('&').filter((v=>v))
  for(let i = 0;i<arr.length;i++){
    let kv = arr[i].split('=')
    let key = kv[0]
    let value = kv[1]
    if(key =='id'){
      id = value
      break
    }
  }
  return id
    }
  }
  controller.init(view,model)
}