'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumbs,
  BreadcrumbsList,
  BreadcrumbsItem,
  BreadcrumbsLink,
  BreadcrumbsPage,
  BreadcrumbsSeparator,
} from '@/components/ui/breadcrumbs';
import { RatingStars } from '@/components/ui/rating-stars';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export default function ComponentsPreview() {
  const [rating, setRating] = React.useState(4);

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">UI Components Preview</h1>
        <p className="text-muted-foreground">
          A showcase of all available UI components
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Breadcrumbs</h2>
        <Breadcrumbs>
          <BreadcrumbsList>
            <BreadcrumbsItem>
              <BreadcrumbsLink href="/">Home</BreadcrumbsLink>
            </BreadcrumbsItem>
            <BreadcrumbsSeparator />
            <BreadcrumbsItem>
              <BreadcrumbsLink href="/products">Products</BreadcrumbsLink>
            </BreadcrumbsItem>
            <BreadcrumbsSeparator />
            <BreadcrumbsItem>
              <BreadcrumbsPage>Current Page</BreadcrumbsPage>
            </BreadcrumbsItem>
          </BreadcrumbsList>
        </Breadcrumbs>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Input & Select</h2>
        <div className="max-w-md space-y-3">
          <Input placeholder="Enter text..." />
          <Input type="email" placeholder="Email address" />
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Alerts</h2>
        <div className="space-y-3 max-w-2xl">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is a default alert with some information.
            </AlertDescription>
          </Alert>
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your action was completed successfully.
            </AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Please review this information carefully.
            </AlertDescription>
          </Alert>
          <Alert variant="danger">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is the card content area.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Action</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Another Card</CardTitle>
              <CardDescription>With different content</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Cards are great for organizing content.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tabs</h2>
        <Tabs defaultValue="tab1" className="max-w-2xl">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <Card>
              <CardHeader>
                <CardTitle>Tab 1 Content</CardTitle>
              </CardHeader>
              <CardContent>This is the content for the first tab.</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tab2">
            <Card>
              <CardHeader>
                <CardTitle>Tab 2 Content</CardTitle>
              </CardHeader>
              <CardContent>This is the content for the second tab.</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tab3">
            <Card>
              <CardHeader>
                <CardTitle>Tab 3 Content</CardTitle>
              </CardHeader>
              <CardContent>This is the content for the third tab.</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Rating Stars</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm mb-2">Read-only rating:</p>
            <RatingStars rating={4.5} showValue />
          </div>
          <div>
            <p className="text-sm mb-2">Interactive rating:</p>
            <RatingStars
              rating={rating}
              readonly={false}
              onChange={setRating}
              showValue
            />
          </div>
          <div>
            <p className="text-sm mb-2">Different sizes:</p>
            <div className="flex items-center gap-4">
              <RatingStars rating={4} size="sm" />
              <RatingStars rating={4} size="md" />
              <RatingStars rating={4} size="lg" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Modal</h2>
        <Modal>
          <ModalTrigger asChild>
            <Button>Open Modal</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Modal Title</ModalTitle>
              <ModalDescription>
                This is a modal dialog. You can put any content here.
              </ModalDescription>
            </ModalHeader>
            <div className="py-4">
              <p>Modal content goes here.</p>
            </div>
            <ModalFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Confirm</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Toast Notifications</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              toast({
                title: 'Default Toast',
                description: 'This is a default toast notification.',
              })
            }
          >
            Show Default Toast
          </Button>
          <Button
            onClick={() =>
              toast({
                title: 'Success!',
                description: 'Your action was completed successfully.',
                variant: 'success',
              })
            }
          >
            Show Success Toast
          </Button>
          <Button
            onClick={() =>
              toast({
                title: 'Error!',
                description: 'Something went wrong.',
                variant: 'danger',
              })
            }
          >
            Show Error Toast
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Skeleton Loaders</h2>
        <div className="space-y-3 max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-3">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
