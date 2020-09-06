# Zigbee2mqttgui

An GUI to manage a zigbee network using the [zigbee2mqtt server](https://www.zigbee2mqtt.io) over mqtt.

## Setup

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.8.

```
nave use latest
npm link @angular/cli
npm install ngx-mqtt
ng add @angular/material
```

Set `hostname` or IP in `src/app/services/zigbee2mqtt.service.ts`.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
