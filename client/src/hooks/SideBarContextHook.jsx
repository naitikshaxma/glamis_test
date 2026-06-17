import React, { createContext, useState } from 'react';

// Create the context
export const SidebarContext = createContext();

// Create the provider

const SidebarProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

export default SidebarProvider;
