# mimoLive-Stream-Deck-Plugin
A plugin for the popular Elgato Stream Deck to control mimoLive.

## Installation and usage

To install the mimoLive Stream Deck plugin, [download the latest release](https://github.com/boinx/mimoLive-Stream-Deck-Plugin/releases).

Then, double click the plugin to load it into the Elgato Stream Deck app.

## Discussion and help

If you have any issues with the mimoLive Stream Deck plugin, you can [open a new Issue on Github](https://github.com/boinx/mimoLive-Stream-Deck-Plugin/issues) or post on the [mimoLive forum](https://forum.boinx.com/c/mimolive/25).

All your feedback is welcome!


## Build Instructions

If you want to play around and make your own changes, here is how to turn the source code into a plugin.

Download the [Elgato Distribution tool](https://developer.elgato.com/documentation/stream-deck/sdk/exporting-your-plugin/).

Then, execute this command:

```bash
./DistributionTool -b -i com.boinx.mimolive.sdPlugin -o ~/Desktop/
```

## Authors and acknowledgment

Many thanks to Daniel Saxer of RedDev.ch for the initiative and the initial code for this plugin.

If you want to see your name listed here, make a contribution!

Based on the Elgato Stream Deck Sample Plugin for Philips Hue
> https://developer.elgato.com/documentation/stream-deck/samples/philipshue/

With code samples from Home Assistant Webhooks for Elgato Stream Deck
> https://github.com/hendricksond/streamdeck-homeassistant-webhook/

## License
[MIT](https://choosealicense.com/licenses/mit/)

 