import express from 'express';
import { VerifyClientID } from '../../middleware';
import AuthRoute from './auth';
import PaymentRoute from './payment';
import TemplateRoute from './template';
import CouponRoute from './token';
import UploadsRoute from './uploads';
import BotRoute from './whatsapp/bot';
import ContactsRoute from './whatsapp/contacts';
import GroupsRoute from './whatsapp/groups';
import LabelsRoute from './whatsapp/labels';
import MessageRoute from './whatsapp/message';
import NumberValidatorRoute from './whatsapp/number-validator';

const router = express.Router();

router.use('/token', CouponRoute);

router.use('/auth', AuthRoute);
router.use('/payment', PaymentRoute);

// Next routes will be protected by VerifyClientID middleware
router.use(VerifyClientID);

router.use('/contacts', ContactsRoute);
router.use('/groups', GroupsRoute);
router.use('/labels', LabelsRoute);
router.use('/message', MessageRoute);
router.use('/bot', BotRoute);
router.use('/numbers', NumberValidatorRoute);
router.use('/template', TemplateRoute);
router.use('/uploads', UploadsRoute);

export default router;
