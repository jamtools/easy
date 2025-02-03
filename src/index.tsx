import React from 'react';

import springboard from 'springboard';

import '@jamtools/core/modules/macro_module/macro_module';

const BUTTON_MIDI_NUMBERS = {
    Play: 1,
    Stop: 2,
    Record: 3,
} as const;

springboard.registerModule('Main', {}, async (moduleAPI) => {
    const macroModule = moduleAPI.deps.module.moduleRegistry.getModule('macro');
    const outputMacro = await macroModule.createMacro(moduleAPI, 'output', 'musical_keyboard_output', {});

    const pressedAction = moduleAPI.createAction('pressedAction', {}, async (args: {actionName: keyof typeof BUTTON_MIDI_NUMBERS}) => {
        const midiNumber = BUTTON_MIDI_NUMBERS[args.actionName];
        for (const eventType of ['noteon', 'noteoff'] as const) {
            outputMacro.send({
                type: eventType,
                number: midiNumber,
                channel: 1,
            });
        }
    });

    moduleAPI.registerRoute('/', {}, () => {
        const buttons = (Object.keys(BUTTON_MIDI_NUMBERS) as Array<keyof typeof BUTTON_MIDI_NUMBERS>).map(actionName => (
            <button
                onClick={() => pressedAction({actionName})}
            >
                {actionName}
            </button>
        ));

        return (
            <div>
                <outputMacro.components.edit />
                <div>
                    {buttons}
                </div>
            </div>
        );
    });
});
