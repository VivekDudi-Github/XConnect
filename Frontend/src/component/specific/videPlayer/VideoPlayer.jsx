import { useEffect, useRef, useState } from 'react' ;

import videojs from 'video.js' ;
import 'video.js/dist/video-js.css' ;



const MenuButton = videojs.getComponent("MenuButton");
const MenuItem = videojs.getComponent("MenuItem");
const Button = videojs.getComponent("Button");

export default function VideoPlayer({ src , type }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      videojs.registerComponent("QualityMenuButton", QualityMenuButton);
      videojs.registerComponent("SeekBackwardButton", SeekBackwardButton);
      videojs.registerComponent("SeekForwardButton", SeekForwardButton);


      const player = videojs(videoRef.current, {
        controls: true,
        fluid: true,
        aspectRatio: "16:9",
        responsive: true,
        sources: [{
          src,
          type: type || "application/x-mpegURL",
        }],
        breakpoints: {
          tiny: 0,
          xsmall: 0,
          small: 294,
          medium: 600,
          large: 600,
        },
      });

      playerRef.current = player;

      const qualityLevels = player.qualityLevels();
      console.log('qualityLevels :' , qualityLevels );
      
      player.on("loadedmetadata", () => {
        player.controlBar.addChild("QualityMenuButton", {});
      })

      player.on('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          player.currentTime(player.currentTime() + 10);
        }
        if (e.key === 'ArrowLeft') {
          player.currentTime(player.currentTime() - 10);
        }
      });

      player.on('ready' , () => {
        const controlBar = player.controlBar;
        controlBar.addChild('SeekBackwardButton', {}, 1);
        controlBar.addChild('SeekForwardButton', {}, 2);
      })

    } else if (playerRef.current) {
      playerRef.current.src({
        src,
        type: "application/x-mpegURL",
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]);

  return (
    <div className="w-full h-fit bg-black overflow-hidden">
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered w-full h-full rounded-lg"
        playsInline
        muted
      />
    </div>
  );
}


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

class QualityMenuButton extends MenuButton {
  constructor(player, options) {
    super(player, options);
    this.addClass("vjs-quality-menu-button");
    this.controlText("Quality");
  }

  createItems() {
    const items = [];
    const levels = this.player().qualityLevels();
    const heights = new Set();

    items.push(
      new QualityMenuItem(this.player(), {
        label: "Auto",
        height: "auto",
        selectable: true,
        selected: true,
      })
    );

    for (let i = 0; i < levels.length; i++) {
      if (levels[i].height) {
        heights.add(levels[i].height);
      }
    }

    [...heights]
      .sort((a, b) => b - a)
      .forEach((h) => {
        items.push(
          new QualityMenuItem(this.player(), {
            label: `${h}p`,
            height: h,
            selectable: true,
          })
        );
      });

    return items;
  }
}


class SeekBackwardButton extends Button {
  constructor(player, options) {
    super(player, options);
    this.controlText("Backward 10 seconds");
    this.addClass("vjs-seek-backward-10");
    this.addClass("vjs-extra-button");
  }

  handleClick() {
    const player = this.player();
    player.currentTime(
      Math.max(0, player.currentTime() - 10)
    );
  }
}

class SeekForwardButton extends Button {
  constructor(player, options) {
    super(player, options);
    this.controlText("Forward 10 seconds");
    this.addClass("vjs-seek-forward-10");
    this.addClass("vjs-extra-button");
  }

  handleClick() {
    const player = this.player();
    const duration = player.duration();
    player.currentTime(
      Math.min(duration, player.currentTime() + 10)
    );
  }
}