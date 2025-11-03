/**
 * Test Page for BlogFlow Demo Components
 *
 * This page tests all the Webflow wrapper components for the blog demo library.
 * Visit http://localhost:3000/test-blog-demo to see the components in action.
 */

'use client';

import { useState } from 'react';
import { PostsListWrapper } from '@/src/libraries/blogDemo/components/PostsList.webflow';
import { ProfileEditorWrapper } from '@/src/libraries/blogDemo/components/ProfileEditor.webflow';
import { PublicPostsListWrapper } from '@/src/libraries/blogDemo/components/PublicPostsList.webflow';
import { PostViewWrapper } from '@/src/libraries/blogDemo/components/PostView.webflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ComponentView = 'postsList' | 'profileEditor' | 'publicPosts' | 'postView';

export default function TestBlogDemoPage() {
  const [activeView, setActiveView] = useState<ComponentView>('publicPosts');
  const [testPostId, setTestPostId] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">BlogFlow Demo Components Test</h1>

          {/* Navigation */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={activeView === 'publicPosts' ? 'default' : 'outline'}
              onClick={() => setActiveView('publicPosts')}
            >
              Public Posts List
            </Button>
            <Button
              variant={activeView === 'postsList' ? 'default' : 'outline'}
              onClick={() => setActiveView('postsList')}
            >
              Posts List (User)
            </Button>
            <Button
              variant={activeView === 'profileEditor' ? 'default' : 'outline'}
              onClick={() => setActiveView('profileEditor')}
            >
              Profile Editor
            </Button>
            <Button
              variant={activeView === 'postView' ? 'default' : 'outline'}
              onClick={() => setActiveView('postView')}
            >
              Post View
            </Button>
          </div>

          {/* Post ID Input (for PostView) */}
          {activeView === 'postView' && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Enter Post ID"
                value={testPostId}
                onChange={(e) => setTestPostId(e.target.value)}
                className="px-3 py-2 border rounded flex-1 max-w-md"
              />
              <p className="text-sm text-gray-600">
                Enter a post ID to test PostView component
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Component Display Area */}
      <div className="py-8">
        {/* Configuration Info Card */}
        <div className="container mx-auto px-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Component Info: {activeView}</CardTitle>
            </CardHeader>
            <CardContent>
              {activeView === 'publicPosts' && (
                <div className="space-y-2 text-sm">
                  <p><strong>Props:</strong></p>
                  <ul className="list-disc list-inside">
                    <li>pageSize: 9 (posts per page)</li>
                    <li>enableSearch: true</li>
                    <li>title: "Blog"</li>
                    <li>subtitle: "Latest published posts"</li>
                  </ul>
                  <p className="text-gray-600 mt-2">
                    This component displays published posts with search and pagination.
                  </p>
                </div>
              )}
              {activeView === 'postsList' && (
                <div className="space-y-2 text-sm">
                  <p><strong>Props:</strong></p>
                  <ul className="list-disc list-inside">
                    <li>defaultFilter: "all"</li>
                    <li>showCreateButton: true</li>
                  </ul>
                  <p className="text-gray-600 mt-2">
                    This component shows the authenticated user's posts with filtering and management capabilities.
                    <strong> Requires authentication.</strong>
                  </p>
                </div>
              )}
              {activeView === 'profileEditor' && (
                <div className="space-y-2 text-sm">
                  <p><strong>Props:</strong></p>
                  <ul className="list-disc list-inside">
                    <li>showCancelButton: true</li>
                  </ul>
                  <p className="text-gray-600 mt-2">
                    This component allows users to edit their profile information.
                    <strong> Requires authentication.</strong>
                  </p>
                </div>
              )}
              {activeView === 'postView' && (
                <div className="space-y-2 text-sm">
                  <p><strong>Props:</strong></p>
                  <ul className="list-disc list-inside">
                    <li>postId: &quot;{testPostId || '(enter ID above)'}&quot;</li>
                    <li>showBackButton: true</li>
                  </ul>
                  <p className="text-gray-600 mt-2">
                    This component displays a single post with full content and author information.
                    Enter a valid post ID above to test.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Component Render */}
        {activeView === 'publicPosts' && (
          <PublicPostsListWrapper
            pageSize={9}
            enableSearch={true}
            title="Blog"
            subtitle="Latest published posts"
          />
        )}

        {activeView === 'postsList' && (
          <PostsListWrapper
            defaultFilter="all"
            showCreateButton={true}
          />
        )}

        {activeView === 'profileEditor' && (
          <ProfileEditorWrapper
            showCancelButton={true}
          />
        )}

        {activeView === 'postView' && (
          <>
            {testPostId ? (
              <PostViewWrapper
                postId={testPostId}
                showBackButton={true}
              />
            ) : (
              <div className="container mx-auto px-4">
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">
                      Enter a post ID in the field above to preview the Post View component
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Note */}
      <div className="container mx-auto px-4 pb-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> These are the actual Webflow wrapper components being tested.
              All components use WebflowProvidersWrapper for proper provider setup.
              Components marked &quot;Requires authentication&quot; will redirect to login if not authenticated.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
