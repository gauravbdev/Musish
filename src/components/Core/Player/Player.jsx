import React from 'react';
import styles from './Player.scss'
import {artworkForMediaItem} from "../common/Utils";
import cx from 'classnames';
import withMK from '../../../hoc/withMK';

class Player extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isScrubbing: false,
      scrubbingPosition: 0,
      isShuffleOn: false,
      isRepeatOn: false,
      volume: 0,
    };

    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.scrubToTime = this.scrubToTime.bind(this);
    this.onStartScrubbing = this.onStartScrubbing.bind(this);
    this.onEndScrubbing = this.onEndScrubbing.bind(this);
    this.onScrub = this.onScrub.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);

    this.handleAddToLibrary = this.handleAddToLibrary.bind(this);
    this.handleRepeat = this.handleRepeat.bind(this);
    this.handleShuffle = this.handleShuffle.bind(this);
    this.onVolumeChange = this.onVolumeChange.bind(this);
    this.getVolumeIconClasses = this.getVolumeIconClasses.bind(this);
  }

  static timeToPercent(time, duration) {
    if (duration === 0) {
      return 0; // For some reason would call this
    }

    return Math.floor((time * 100) / duration);
  }

  async scrubToTime(time) {
    await this.props.mk.instance.player.seekToTime(time);
  }

  handlePlay() {
    this.props.mk.instance.player.play();
  }

  handlePause() {
    this.props.mk.instance.player.pause();
  }

  handlePrevious() {
    const player = this.props.mk.instance.player;

    if (this.state.playbackTime < 2) {
      player.skipToPreviousItem();
    } else {
      player.seekToTime(0)
    }
  }

  handleNext() {
    const song = this.props.mk.instance.player
    song.skipToNextItem();

    if (song.repeatMode === 1) {
      song.seekToTime(0);
    }
  }

  handleAddToLibrary() {
    const music = this.props.mk.instance;
    music.player.addToLibrary = 1;
  }

  handleRepeat() {
    const music = this.props.mk.instance;
    const {isRepeatOn} = this.state;

    if (music.player.repeatMode === 0) {
      this.setState({
        isRepeatOn: true,
      });
      music.player.repeatMode = 1;
    }
    else if (music.player.repeatMode === 1) {
      this.setState({
        isRepeatOn: true,
      });
      music.player.repeatMode = 2;
    }
    else {
      this.setState({
        isRepeatOn: false,
      });
      music.player.repeatMode = 0;
    }
  }

  handleShuffle() {
    const music = this.props.mk.instance;

    if (this.state.isShuffleOn === false) {
      this.setState({
        isShuffleOn: true,
      });
      music.player.shuffleMode = 1;
    }
    else {
      this.setState({
        isShuffleOn: false,
      });
      music.player.shuffleMode = 0;
    }
  }

  onVolumeChange(e) {
    this.props.mk.instance.player.volume = e.target.value;
  }

  getVolumeIconClasses() {
    const volume = this.props.mk.instance.player.volume * 100;

    if (volume === 0) {
      return 'fas fa-times';
    }

    if (volume > 0 && volume < 30) {
      return 'fas fa-volume-off';
    }

    if (volume >= 30 && volume < 60) {
      return 'fas fa-volume-down';
    }

    return 'fas fa-volume-up';
  }

  renderProgress() {
    const {mediaItem: {item: nowPlayingItem}, playbackTime} = this.props.mk;
    const duration = nowPlayingItem.playbackDuration / 1000;
    const percent = Player.timeToPercent(playbackTime.currentPlaybackTime, duration);

    return (
      <input
        className={styles['progress-bar']}
        style={{backgroundSize: `${percent}% 100%`}}
        type={'range'}
        value={this.getScrubberValue()}
        onChange={this.onScrub}
        onMouseDown={this.onStartScrubbing}
        onMouseUp={this.onEndScrubbing}
        min={0}
        max={nowPlayingItem.playbackDuration}
        step={0.01}
      />
    );
  }

  onScrub(e) {
    this.setState({
      scrubbingPosition: e.target.value
    })
  }

  onStartScrubbing(e) {
    this.setState({
      isScrubbing: true,
      scrubbingPosition: e.target.value,
    })
  }

  async onEndScrubbing(e) {
    await this.scrubToTime(e.target.value / 1000);

    this.setState({
      isScrubbing: false,
      scrubbingPosition: null,
    });
  }

  getScrubberValue() {
    if (this.state.isScrubbing) {
      return this.state.scrubbingPosition;
    }

    return this.props.mk.playbackTime.currentPlaybackTime * 1000;
  }

  render() {
    const {mk} = this.props;
    const nowPlayingItem = mk.mediaItem && mk.mediaItem.item;

    if (!nowPlayingItem) {
      return null;
    }

    const artworkURL = artworkForMediaItem(nowPlayingItem, 40);

    return (
      <div className={styles.player}>
        <div className={styles['main-info']}>
          <div className={styles.picture}>
            <img src={artworkURL} className={styles.image} alt={'album artwork'}/>
          </div>
          <div className={styles.track}>
            <h1>{nowPlayingItem.title}</h1>
            <h2>{nowPlayingItem.attributes.artistName}</h2>
            <h3>{nowPlayingItem.attributes.albumName}</h3>
          </div>
        </div>
        {this.renderProgress()}
        <div className={styles.buttons}>
          <span onClick={this.handlePrevious}>
            <i className={'fas fa-backward'}/>
          </span>
          {mk.instance.player.isPlaying ? (
            <span className={styles.main} onClick={this.handlePause}>

              <i className={"fas fa-pause"}/>
            </span>
          ) : (
            <span className={styles.main} onClick={this.handlePlay}>
              <i className={"fas fa-play"}/>
            </span>
          )}
          <span onClick={this.handleNext}>
            <i className={"fas fa-forward"}/>
          </span>
        </div>

        <div className={styles.buttons}>

          <span className={styles.controls} onClick={this.handleAddToLibrary}>
            <i className={"fas fa-plus"}/>
          </span>

          <span className={cx(styles.controls, {[styles.shuffle]: this.state.isRepeatOn})} onClick={this.handleRepeat}>
            <i className={"fas fa-redo-alt"}/>
          </span>

          <span className={cx(styles.controls, {[styles.shuffle]: this.state.isShuffleOn})}
                onClick={this.handleShuffle}>
            <i className={"fas fa-random"}/>
          </span>

          <span className={cx(styles.controls, styles.volumeControlWrapper)}>
            <i className={this.getVolumeIconClasses()}/>
            <div className={styles.volumeControlContainer}>
              <div className={styles.volumeBarWrapper}>
                <input
                  className={cx(styles['progress-bar'], styles.volumeBar)}
                  style={{backgroundSize: `${this.props.mk.instance.player.volume * 100}% 100%`}}
                  type={'range'}
                  value={this.props.mk.instance.player.volume}
                  onChange={this.onVolumeChange}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </div>
            </div>
          </span>

        </div>

      </div>
    );
  }
}

const bindings = {
  [MusicKit.Events.mediaItemDidChange]: 'mediaItem',
  [MusicKit.Events.queueItemsDidChange]: 'queueItems',
  [MusicKit.Events.queuePositionDidChange]: 'queuePosition',
  [MusicKit.Events.playbackTimeDidChange]: 'playbackTime',
  [MusicKit.Events.playbackStateDidChange]: 'playbackState',
  [MusicKit.Events.playbackVolumeDidChange]: 'playbackVolume',
};

export default withMK(Player, bindings);
