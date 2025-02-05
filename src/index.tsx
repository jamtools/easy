import React from 'react';

import springboard from 'springboard';
import '@jamtools/core/modules/macro_module/macro_module';

const BUTTON_MIDI_NUMBERS = {
    Play: 1,
    Stop: 2,
    Record: 3,
} as const;

// @platform "node"
const toggleArm = async () => {
    const {runRobotJsToggleArmAndTrack} = await import('./robot');
    await runRobotJsToggleArmAndTrack();
};
// @platform end

springboard.registerModule('Easy', {}, async (moduleAPI) => {
    const macroModule = moduleAPI.deps.module.moduleRegistry.getModule('macro');
    const outputMacro = await macroModule.createMacro(moduleAPI, 'output', 'musical_keyboard_output', {});

    const toggleArmState = await moduleAPI.statesAPI.createPersistentState('toggleArmState', false);

    const pressedAction = moduleAPI.createAction('pressedAction', {}, async (args: {actionName: keyof typeof BUTTON_MIDI_NUMBERS}) => {
        if (toggleArmState.getState()) {
            await toggleArm();
            toggleArmState.setState(false);
        }

        const midiNumber = BUTTON_MIDI_NUMBERS[args.actionName];
        for (const eventType of ['noteon', 'noteoff'] as const) {
            outputMacro.send({
                type: eventType,
                number: midiNumber,
                channel: 1,
            });
        }
    });

    const pressedToggleArmCheckbox = moduleAPI.createAction('toggleArm', {}, async () => {
        toggleArmState.setState(state => !state);
    });

    moduleAPI.registerRoute('/', {}, () => {
        const buttons = (Object.keys(BUTTON_MIDI_NUMBERS) as Array<keyof typeof BUTTON_MIDI_NUMBERS>).map(actionName => (
            <button
                style={{display: 'inline-block', fontSize: '60px', margin: '10px', width: '80%', maxWidth: '500px'}}
                onClick={() => pressedAction({actionName})}
            >
                {actionName}
            </button>
        ));

        const toggleArmCheckbox = (
            <div>
                <label>
                    Toggle Arm
                </label>
                <input
                    type='checkbox'
                    checked={toggleArmState.useState()}
                    onChange={() => pressedToggleArmCheckbox({})}
                    style={{display: 'inline-block', fontSize: '60px', margin: '10px', width: '80%', maxWidth: '500px'}}
                />
            </div>
        );

        return (
            <div>
                <details>
                    <summary>Configure</summary>
                    <outputMacro.components.edit />
                    <p style={{maxWidth: '400px'}}>Let's record some music!!! If you're on Mac, follow <a href='https://support.apple.com/guide/audio-midi-setup/transfer-midi-information-between-apps-ams1013/mac'>this</a> to set up a virtual midi bus. Then press edit above, then select the same virtual midi bus you created earlier to send messages to. Then go in your DAW and enable "Remote" control for the same virtual midi bus. Then enable midi mapping mode in the DAW. Then in the DAW, click the play button, then in the web UI click the play button. Then do the same for the stop and record buttons. Then exit midi mapping mode in the DAW. You should now be able to use the Play, Stop, and Record buttons to interact with your DAW. Then click Configure to close this message.</p>
                </details>
                <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
                    {buttons}
                    {toggleArmCheckbox}
                </div>
            </div>
        );
    });
});
