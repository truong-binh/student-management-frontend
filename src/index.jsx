import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import "tw-elements-react/dist/css/tw-elements-react.min.css";
import reportWebVitals from './reportWebVitals';
import { RouterProvider } from 'react-router-dom';
import router from './router/route.js';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import 'animate.css';
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

Chart.register(CategoryScale);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <ToastContainer />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
);

reportWebVitals();
