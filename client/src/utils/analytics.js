import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

export function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        if (!GA_MEASUREMENT_ID || !window.gtag) return;

        // Track page view
        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: location.pathname + location.search,
        });
    }, [location]);
}

export function trackEvent(eventName, eventParams = {}) {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;

    window.gtag('event', eventName, eventParams);
}

export function trackPageView(path) {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;

    window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: path,
    });
}

// Initialize Google Analytics
export function initGA() {
    if (!GA_MEASUREMENT_ID) {
        console.warn('Google Analytics Measurement ID not found. Set VITE_GA_MEASUREMENT_ID in .env');
        return;
    }

    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
        window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: false, // We'll handle page views manually
    });
}

// Event tracking helpers
export const analytics = {
    // Page events
    pageView: (path) => trackPageView(path),

    // User interactions
    search: (query) => trackEvent('search', { search_term: query }),
    sharePost: (postTitle, method) => trackEvent('share', {
        content_type: 'post',
        item_id: postTitle,
        method: method
    }),

    // Content interactions
    readPost: (postTitle, category) => trackEvent('read_post', {
        content_title: postTitle,
        content_category: category,
    }),
    submitComment: (postTitle) => trackEvent('submit_comment', {
        content_title: postTitle,
    }),

    // Newsletter
    subscribe: () => trackEvent('newsletter_subscribe', {
        method: 'footer_form',
    }),

    // Navigation
    clickCategory: (categoryName) => trackEvent('select_content', {
        content_type: 'category',
        item_id: categoryName,
    }),

    // Engagement
    timeOnPage: (seconds, pageTitle) => trackEvent('timing_complete', {
        name: 'time_on_page',
        value: seconds,
        event_label: pageTitle,
    }),
};

export default { initGA, usePageTracking, trackEvent, analytics };
