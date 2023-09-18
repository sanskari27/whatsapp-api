import express from 'express';
import ContactsRoute from './contacts';
import GroupsRoute from './groups';
import LabelsRoute from './labels';
import CouponRoute from './token';
import { VerifyClientID } from '../../middleware';

const router = express.Router();

router.use('/token', CouponRoute);

// Next routes will be protected by VerifyClientID middleware
router.use(VerifyClientID);

router.use('/contacts', ContactsRoute);
router.use('/groups', GroupsRoute);
router.use('/labels', LabelsRoute);

export default router;
