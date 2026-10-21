import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',workers:1,timeout:45000,use:{baseURL:process.env.TEST_URL??'http://127.0.0.1:5175',headless:true,viewport:{width:1366,height:900},launchOptions:{channel:'chrome'}},reporter:'list'});
