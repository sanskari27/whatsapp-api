import express from 'express';
import { getContacts, getGroups, getLabels } from '../controller';

const router = express.Router();

/**
 * Creates a router for all the routes in version 1 of the API
 *
 * @returns the router
 */

router.get('/:client_id/contacts', getContacts);
router.get('/:client_id/groups', getGroups);
router.get('/:client_id/labels', getLabels);

export default router;
