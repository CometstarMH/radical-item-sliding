![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# radical-item-sliding

This is a clone of [`ion-item-sliding`](https://ionicframework.com/docs/api/item-sliding) from [Ionic Framwork](https://ionicframework.com), with the sliding action being triggered by click instead of drag events. 

The component is built with Stencil, the same underlying framework used by components in Ionic Framwork (v4). Which means wherever Stencil is supported, this component should also be compatible.

The usage for this component remains largely the same as `ion-item-sliding`; you can put `ion-item-options` under this element, specifying `start` or `end` in `side` attribute. Since there is no direction in a click event, **this component only supports one `ion-item-options` opening from one side**; the **first `ion-item-options` always wins**, with all remaining ones ignored.

## Project Status

This project is still in a proof-of-concept stage. However, code cleanup and detailed testings aside, the component is stable enough and pretty usable as-is. It has also been deployed and actively used in a production environment at my previous workplace. 

If you find a bug, you are welcome to open a pull request. However, I would like to keep the scope of this project small. Feature request will be considered, but may not always be accepted.

## Using this component

Currently this project has not been publish to npm yet, so you need to follow Stencil doc for building and incuding the component in a project. 

For example, if you are using Anuglar, you can follow <https://stenciljs.com/docs/angular>. 

Detailed API doc is still WIP.

## TODO

 - [ ] should I render the ignored ion-item-options?
 - [x] code cleaning: refactor current logic as currently it is just calling all original drag handelers on click
 - [ ] unit test?
 - [ ] doc