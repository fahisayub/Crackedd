"use client";

/**
 * SlackIntegrationModal.tsx
 * Modal wrapper for the SlackIntegration component
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@heroui/react';
import { SlackIntegration } from './SlackIntegration';
import { SlackIcon } from 'lucide-react';

interface SlackIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SlackIntegrationModal({ isOpen, onClose }: SlackIntegrationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      className="dark:bg-background"
      placement="center"
      backdrop="blur"
      hideCloseButton={false}
    >
      <ModalContent className="z-[1000]">
        {(onModalClose) => (
          <>
            <ModalHeader className="flex items-center gap-2 dark:border-gray-700">
              <div className="bg-[#4A154B] p-1 rounded">
                <SlackIcon className="h-5 w-5 text-white" />
              </div>
              <span>Slack Integration</span>
            </ModalHeader>
            <ModalBody className="p-0 overflow-auto max-h-[70vh]">
              <div className="p-4">
                <SlackIntegration />
              </div>
            </ModalBody>
            <ModalFooter className="dark:border-gray-700">
              <Button
                color="primary"
                variant="flat"
                onPress={onModalClose}
                className="rounded-md"
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
