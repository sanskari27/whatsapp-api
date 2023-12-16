import express from 'express';
import { VerifyClientID } from '../../middleware';
import AuthRoute from './auth';
import ContactCardRoute from './contact-card';
import PaymentRoute from './payment';
import ReportsRoute from './report';
import ShortnerRoute from './shortner';
import TemplateRoute from './template';
import CouponRoute from './token';
import UploadsRoute from './uploads';
import WebhooksRoute from './webhooks';
import WhatsappRoute from './whatsapp';

const router = express.Router();

// Next routes will be webhooks routes

router.use('/webhooks', WebhooksRoute);

// Next rotes are common routes

router.use('/token', CouponRoute);
router.use('/shortner', ShortnerRoute);

router.use('/auth', AuthRoute);
router.use('/payment', PaymentRoute);

// Next routes will be protected by VerifyClientID middleware
router.use(VerifyClientID);

router.use('/whatsapp', WhatsappRoute);
router.use('/template', TemplateRoute);
router.use('/uploads', UploadsRoute);
router.use('/reports', ReportsRoute);
router.use('/contact-card', ContactCardRoute);

export default router;
