mv yarn.lock cached-yarn.lock
(yarn fresh && yarn test && mv cached-yarn.lock yarn.lock) || mv yarn.lock failed-yarn.lock && mv cached-yarn.lock yarn.lock