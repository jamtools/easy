import robot from 'robotjs';

const t = async (time = 20) => {
    return new Promise<void>(r => {
        setTimeout(() => {
            r();
        }, time);
    });
};

export const runRobotJsToggleArmAndTrack = async () => {
    robot.setMouseDelay(100);
    const originalMousePosition = robot.getMousePos();

    await switchToDAW();
    await toggleArmAndTrack();
    await returnToOriginalWindow(originalMousePosition);
};

const switchWindows = async () => {
    robot.keyTap('tab', 'command');
    await t();
    robot.keyToggle('tab', 'up');
    await t();

    // TODO: add switch statement for OS here
};

const switchToDAW = async () => {
    await switchWindows();
    robot.setMouseDelay(100);
    await t();
}

let toggledOrder = true;

const trackButtonsY = 370;
const speakerOnButtonX = 1370;
const armButtonX = 1330;

const toggleArmAndTrack = async () => {
    let dawArmButtonX = toggledOrder ? speakerOnButtonX : armButtonX;

    robot.moveMouse(dawArmButtonX, trackButtonsY);
    await t();
    robot.mouseClick();
    await t();

    dawArmButtonX = toggledOrder ? armButtonX : speakerOnButtonX;

    robot.moveMouse(dawArmButtonX, trackButtonsY);
    await t();
    robot.mouseClick();
    await t();

    toggledOrder = !toggledOrder;
}

const returnToOriginalWindow = async (originalMousePosition: {x: number; y: number}) => {
    await switchWindows();
    await t();

    robot.moveMouse(originalMousePosition.x, originalMousePosition.y);
}
