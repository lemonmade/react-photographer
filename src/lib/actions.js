import {Rect} from './geometry';

async function handleHoverAction({position: pos}, server) {
  const center = new Rect(pos).center;
  await server.page.sendEvent('mousemove', center.x, center.y);
  server.send({performedAction: 'hover'});
}

handleHoverAction.applies = ({action}) => action === 'hover';

async function handleMousedownAction({position: pos}, server) {
  const center = new Rect(pos).center;
  await server.page.sendEvent('mousedown', center.x, center.y);
  server.send({performedAction: 'mousedown'});
}

handleMousedownAction.applies = ({action}) => action === 'mousedown';

export default async function handleAction(message, server) {
  const action = [handleHoverAction, handleMousedownAction].find((anAction) => anAction.applies(message));
  if (action == null) { return; }
  await action(message, server);
}
