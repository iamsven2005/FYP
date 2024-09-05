import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <Card className="max-w-sm mx-auto mt-10 bg-base-100 text-base-content">
      <CardHeader>
        <h2 className="text-2xl font-bold text-primary">About Us</h2>
      </CardHeader>
      <CardContent>
        <p className="text-lg mb-4">
          Welcome to NTUC, a place where food quality, safety, and compliance matter. We are committed to enhancing our food labeling processes to ensure consumers receive the most accurate and up-to-date information.
        </p>
        <p className="text-lg mb-4">
          Our mission is to ensure transparency and trust by utilizing the best technologies and practices in the food industry.
        </p>
        <div className="flex justify-center space-x-4 mt-8">
          <a href="/contact" className="btn btn-primary">Contact Us</a>
          <a href="/" className="btn btn-outline">Go Back Home</a>
        </div>
      </CardContent>
    </Card>
  );
};

export default About;
