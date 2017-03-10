/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import plans from './plans';
import read from './read';
import sites from './sites';
import timezones from './timezones';
import videos from './videos';

export const handlers = mergeHandlers(
	plans,
	read,
	sites,
	timezones,
	videos,
);

export default handlers;
