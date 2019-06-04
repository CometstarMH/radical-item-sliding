# radical-item-sliding



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                | Type      | Default |
| ---------- | ---------- | ---------------------------------------------------------- | --------- | ------- |
| `disabled` | `disabled` | If `true`, the user cannot interact with the sliding-item. | `boolean` | `false` |


## Events

| Event     | Description                                | Type                |
| --------- | ------------------------------------------ | ------------------- |
| `ionDrag` | Emitted when the sliding position changes. | `CustomEvent<void>` |


## Methods

### `close() => Promise<void>`

Close the sliding item. Items can also be closed from the [List](../../list/List).

#### Returns

Type: `Promise<void>`



### `closeOpened() => Promise<boolean>`

Close all of the sliding items in the list. Items can also be closed from the [List](../../list/List).

#### Returns

Type: `Promise<boolean>`



### `getOpenAmount() => Promise<number>`

Get the amount the item is open in pixels.

#### Returns

Type: `Promise<number>`



### `getSlidingRatio() => Promise<number>`

Get the ratio of the open amount of the item compared to the width of the options.
If the number returned is positive, then the options on the right side are open.
If the number returned is negative, then the options on the left side are open.
If the absolute value of the number is greater than 1, the item is open more than
the width of the options.

#### Returns

Type: `Promise<number>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
