import express from 'express';
import ContactsRoute from './whatsapp/contacts';
import GroupsRoute from './whatsapp/groups';
import LabelsRoute from './whatsapp/labels';
import CouponRoute from './token';
import PaymentRoute from './payment';
import AuthRoute from './auth';
import UploadsRoute from './uploads';
import TemplateRoute from './template';
import MessageRoute from './whatsapp/message';
import { VerifyClientID } from '../../middleware';

const router = express.Router();

router.use('/token', CouponRoute);

router.use('/auth', AuthRoute);
router.use('/payment', PaymentRoute);
router.use('/uploads', UploadsRoute);

// Next routes will be protected by VerifyClientID middleware
router.use(VerifyClientID);

router.use('/contacts', ContactsRoute);
router.use('/groups', GroupsRoute);
router.use('/labels', LabelsRoute);
router.use('/message', MessageRoute);
router.use('/template', TemplateRoute);

export default router;
