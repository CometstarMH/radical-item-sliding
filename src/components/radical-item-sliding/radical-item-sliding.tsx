import { Component, Element, Event, EventEmitter, Method, Prop, State, Listen, Host, h } from '@stencil/core';
import { Subject, from, fromEvent, Subscription } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';

const SWIPE_MARGIN = 30;
const ELASTIC_FACTOR = 0.55;

const enum ItemSide {
  None = 0,
  Start = 1 << 0,
  End = 1 << 1,
  Both = Start | End
}

const enum SlidingState {
  Disabled = 1 << 1,
  Enabled = 1 << 2,
  End = 1 << 3,
  Start = 1 << 4,

  SwipeEnd = 1 << 5,
  SwipeStart = 1 << 6,
}

const later = (timeout?: number, ...args: any[]) => new Promise(resolve => window.setTimeout(resolve, timeout, ...args));

/**
 * Wait for exactly 1 frame to complete redering, using requestAnimationFrame + Promise instead of double requestAnimationFrame.
 * The fulfilled handler (via .then(handler)) is added as microtask, or PromiseJobs, as defined in ECMAScript 2015.
 * As the microtask is added when animation frame callbacks are run, the microtask will be run in the next tick, and before another rendering.
 * Therefore, any code that needs to wait for rendering should be put inside the handler.
 * Or, more conveniently, use async/await.
 */
function waitForRender() {
  // let intermediate = function () {window.requestAnimationFrame(fn)};
  // window.requestAnimationFrame(intermediate);
  return new Promise<void>((resolve: () => void) => {
    // window.requestAnimationFrame(() => Promise.resolve().then(() => resolve()));
    window.requestAnimationFrame(resolve);
  });
  
}

/*
 * This component is a direct copy of ionic-item-sliding from Ionic framwork
 * The only differences are: the sliding is activated by click event rather than drag event
 *                           only ion-item-options that are set on 'end' side are shown
 *                           use different mechanism to close all other sliding items, including any original ionic-item-sliding
 *
 * TODO: Stencil component does not want to work with Angular AOT
 */
@Component({
  tag: 'radical-item-sliding',
  styleUrl: 'radical-item-sliding.scss'
})
export class RadicalItemSliding {
  private mode = document.documentElement.getAttribute('mode');

  private itemEl: any/*HTMLIonItemElement*/ | null = null;
  private leftOptions?: any/*HTMLIonItemOptionsElement*/;
  private rightOptions?: any/*HTMLIonItemOptionsElement*/;
  private sides = ItemSide.None;
  /**
   * positive => open right (end) side, negative = > open left (start) side
   */
  private openAmount = 0;
  private initialOpenAmount = 0;
  private optsWidthRightSide = 0;
  private optsWidthLeftSide = 0;
  private optsDirty = true;
  private closed = true;

  private click$ = new Subject<void>();
  private transitionendSub: Subscription;

  @Element() el!: any/*HTMLIonItemSlidingElement*/;

  @State() state: SlidingState = SlidingState.Disabled;

  //@Prop({ context: 'queue' }) queue!: QueueApi;

  /**
   * If `true`, the user cannot interact with the sliding-item.
   */
  @Prop() disabled = false;

  /**
   * Emitted when the sliding position changes.
   */
  @Event() ionDrag!: EventEmitter;

  constructor() {
    this.click$.pipe(exhaustMap(_ => from(this.handler()))).subscribe();
  }

  @Listen('click')
  async handleClick(event: MouseEvent) {
    this.click$.next();
  }

  private async handler() {
    // button is disabled, do nothing
    if (this.disabled || this.sides == ItemSide.None) {
      return;
    }

    let opening = this.closed;
    if (opening) { await this.closeOpened(); }

    this.optsDirty = true;
    let originalState = this.state;
    this.state = SlidingState.Enabled;

    this.initialOpenAmount = this.openAmount;
    if (this.itemEl) {
      this.itemEl.style.transition = 'none'; // inline style to override class style => disable animation
      await waitForRender(); //wait for render
    }
    
    // 
    if (this.optsDirty) {
      this.calculateOptsWidth();
    }
    
    let newOpenAmount = this.initialOpenAmount - (opening ? -2 : 2);

    switch (this.sides) {
      case ItemSide.End: newOpenAmount = this.optsWidthRightSide; break;
      case ItemSide.Start: newOpenAmount = -this.optsWidthLeftSide; break;
      case ItemSide.Both: break;
      default: console.warn('invalid ItemSideFlags value', this.sides); break;
    }

    //await this.setOpenAmount(newOpenAmount, false);

    //
    let restingPoint = newOpenAmount;

    if (!opening) {
      restingPoint = 0;
      this.state = originalState; // keep state as original, state will be reset only when sliding animation ends
    }

    await this.setOpenAmount(restingPoint, true);

    // we only have click here, so there is no 'fully swiped' (swiped further than SWIPE_MARGIN), so no ionSwipe events
    /*
    if ((this.state & SlidingState.SwipeEnd) !== 0 && this.rightOptions) {
      this.rightOptions.fireSwipeEvent();
    } else if ((this.state & SlidingState.SwipeStart) !== 0 && this.leftOptions) {
      this.leftOptions.fireSwipeEvent();
    }
    */
  }

  async componentDidLoad() {
    console.debug('componentDidLoad', this.el);
    this.itemEl = this.el.querySelector('ion-item');
    console.debug(this.itemEl);
    this.transitionendSub = fromEvent(this.itemEl, 'transitionend').subscribe(() => {
      console.debug('transitionend');
      if (this.closed) {
        this.state = SlidingState.Disabled;
      }
    });
    await this.updateOptions();
  }

  componentDidUnload() {
    this.transitionendSub.unsubscribe();
    this.itemEl = null;
    this.leftOptions = this.rightOptions = undefined;
  }

  /**
   * Get the amount the item is open in pixels.
   */
  @Method()
  async getOpenAmount() {
    return this.openAmount;
  }

  /**
   * Get the ratio of the open amount of the item compared to the width of the options.
   * If the number returned is positive, then the options on the right side are open.
   * If the number returned is negative, then the options on the left side are open.
   * If the absolute value of the number is greater than 1, the item is open more than
   * the width of the options.
   */
  @Method()
  async getSlidingRatio(){
    return this.getSlidingRatioSync();
  }

  /**
   * Close the sliding item. Items can also be closed from the [List](../../list/List).
   */
  @Method()
  async close() {
    await this.setOpenAmount(0, true);
  }

  /**
   * Close all of the sliding items in the list. Items can also be closed from the [List](../../list/List).
   */
  @Method()
  async closeOpened(): Promise<boolean> {
    /*
    if (openSlidingItem !== undefined) {
      openSlidingItem && openSlidingItem.close();
      openSlidingItem = undefined;
      return true;
    }
    return false;
    */
    let ps: Promise<void>[] = [];
    document.querySelectorAll('radical-item-sliding').forEach(r=>ps.push(r.close()));
    document.querySelectorAll('ion-item-sliding').forEach((r: any)=>ps.push(r && r.close ? r.close() : Promise.resolve()));
    return Promise.all(ps).then(() => true).catch(() => false);
  }


  private async updateOptions() {
    console.debug('updateOptions');
    const options = this.el.querySelectorAll('ion-item-options');
    console.debug(options);

    let sides = 0;

    // Reset left and right options in case they were removed
    this.leftOptions = this.rightOptions = undefined;

    for (let i = 0; i < options.length; i++) {
      const option = await options.item(i).componentOnReady();

      if (option.side === 'start') {
        this.leftOptions = option;
        sides |= ItemSide.Start;
      } else {
        this.rightOptions = option;
        sides |= ItemSide.End;
      }
    }

    console.debug(this.rightOptions);
    this.optsDirty = true;
    this.sides = sides;
  }

  /**
   * recalculate optsWidthRightSide or optsWidthLeftSide, then set optsDirty to false
   */
  private calculateOptsWidth() {
    console.debug('calculateOptsWidth');
    this.optsWidthRightSide = 0;
    if (this.rightOptions) {
      this.optsWidthRightSide = this.rightOptions.offsetWidth;
    }

    this.optsWidthLeftSide = 0;
    if (this.leftOptions) {
      this.optsWidthLeftSide = this.leftOptions.offsetWidth;
    }
    this.optsDirty = false;

    console.debug(this.optsWidthRightSide, this.optsWidthLeftSide);
  }

  private setOpenAmount(openAmount: number, isFinal: boolean): Promise<void> {
    console.debug('setOpenAmount', openAmount, isFinal);

    this.closed = openAmount == 0;
    
    if (!this.itemEl) {
      console.error('host element missing!');
      return Promise.resolve();
    }
    const style = this.itemEl.style;
    this.openAmount = openAmount;

    if (isFinal) {
      style.transition = ''; // clear inline style to allow class style => enable animation
    }

    if (openAmount > 0) {
      this.state = (openAmount >= (this.optsWidthRightSide + SWIPE_MARGIN))
        ? SlidingState.End | SlidingState.SwipeEnd
        : SlidingState.End;
    } else if (openAmount < 0) {
      this.state = (openAmount <= (-this.optsWidthLeftSide - SWIPE_MARGIN))
        ? SlidingState.Start | SlidingState.SwipeStart
        : SlidingState.Start;
    } else {
      // state is reset in transitionend event instead of using a timer
      // state must be set after animation so host element class is updated to hide the item options only after animation 
      style.transform = '';
      return waitForRender();
    }

    console.debug('set transform');
    style.transform = `translate3d(${-openAmount}px,0,0)`;
    this.ionDrag.emit({
      amount: openAmount,
      ratio: this.getSlidingRatioSync()
    });
    return waitForRender();
  }

  private getSlidingRatioSync(): number {
    if (this.openAmount > 0) {
      return this.openAmount / this.optsWidthRightSide;
    } else if (this.openAmount < 0) {
      return this.openAmount / this.optsWidthLeftSide;
    } else {
      return 0;
    }
  }
  
  // replace hostData method with Host element returned from render method
  // https://github.com/ionic-team/stencil/blob/7b7d0725618b2a17181389096ac60de08e1c766f/BREAKING_CHANGES.md
  render() {
    return (
      <Host
        class={{
          [`${this.mode}`]: true,
          'item-sliding-active-slide': (this.state !== SlidingState.Disabled),
          'item-sliding-active-options-end': (this.state & SlidingState.End) !== 0,
          'item-sliding-active-options-start': (this.state & SlidingState.Start) !== 0,
          'item-sliding-active-swipe-end': (this.state & SlidingState.SwipeEnd) !== 0,
          'item-sliding-active-swipe-start': (this.state & SlidingState.SwipeStart) !== 0
        }}
      />
    );
  }
}
