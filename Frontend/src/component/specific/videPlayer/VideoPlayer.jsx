import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { useEffect, useRef, useState } from 'react'

export default function VideoPlayer({ src }) {
  const videoRef = useRef(null)
  const playerRef = useRef(null)

  const [qualities , setQualities] = useState([]) ;

  useEffect(() => {
    if (!playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        fluid: true,
        autoPlay : false ,
        aspectRatio: "16:9", 
        responsive: true,
        sources: [
          {
            src,
            type: 'application/x-mpegURL'
          }
        ]
      })
    } else {
      playerRef.current.src({ src, type: 'application/x-mpegURL' })
    }
    let player = playerRef.current ;

    player.on('loadedmetadata', () => {
      const qualityLevels = player.qualityLevels()
      let qs = [] ;

      for(let i = 0; i < qualityLevels.length; i++){
        qs.push(qualityLevels[i].height) ;
        console.log('Quality Level ', i, qualityLevels[i]) ;
        qualityLevels[i].enabled = true ;
      }
      qs.sort((a, b) => a - b) ;
      setQualities(qs);

    }) ;

    return () => {
      playerRef.current?.dispose()
      playerRef.current = null
    }
  }, [src])

  const selectQuality = (q) => {
    const levels = playerRef.current.qualityLevels() ;
    
    if(q === 'auto'){
      for(let i = 0; i < levels.length; i++){
        levels[i].enabled = true ;
      }
    }else {
      for(let i = 0; i < levels.length; i++){
        levels[i].enabled = levels[i].height === q ;
      }
    }
  }

// console.log(qualities);

  return (
    <div className="w-full h-full bg-black overflow-hidden flex items-center justify-center">
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered h-full w-full rounded-lg"
        playsInline
        muted
        // controls
      />
      <select onChange={(e) => selectQuality(e.target.value)} className='text-white bg-black' name="Qualities" id="">
        <option value='auto'>Auto</option> 
        {qualities.map(q => (
          <option key={q} value={q}>{q}p</option>
        ))}
      </select>
    </div>
  )
}



const MenuButton = videojs.getComponent("MenuButton");

class QualityMenuButton extends MenuButton {
  constructor(player, options) {
    super(player, options);
    this.controlText("Quality");
  }

  createItems() {
    const items = [];
    const levels = this.player().qualityLevels();
    const heights = new Set();

    items.push(new QualityMenuItem(this.player(), {
      label: "Auto",
      height: "auto",
      selectable: true,
      selected: true
    }));

    for (let i = 0; i < levels.length; i++) {
      heights.add(levels[i].height);
    }

    [...heights].sort((a, b) => a - b).forEach(h => {
      items.push(new QualityMenuItem(this.player(), {
        label: `${h}p`,
        height: h,
        selectable: true
      }));
    });

    return items;
  }
}

const MenuItem = videojs.getComponent("MenuItem");

class QualityMenuItem extends MenuItem {
  constructor(player, options) {
    super(player, options);
    this.height = options.height;
    this.on("click", this.handleClick);
  }

  handleClick() {
    const levels = this.player().qualityLevels();

    if (this.height === "auto") {
      for (let i = 0; i < levels.length; i++) {
        levels[i].enabled = true;
      }
    } else {
      for (let i = 0; i < levels.length; i++) {
        levels[i].enabled = levels[i].height === this.height;
      }
    }
  }
}
