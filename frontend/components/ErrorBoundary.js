import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { captureException } from '../config/sentry';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    // Hata durumunda state'i güncelle
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Hatayı Sentry'ye gönder
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    captureException(error, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      errorInfo: errorInfo,
      stack: error.stack
    });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false
    });
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Bir Hata Oluştu</Text>
            <Text style={styles.errorMessage}>
              Uygulamada beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
            </Text>
            
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={this.handleRetry}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>

            {__DEV__ && (
              <TouchableOpacity 
                style={styles.detailsButton} 
                onPress={this.toggleDetails}
              >
                <Text style={styles.detailsButtonText}>
                  {this.state.showDetails ? 'Detayları Gizle' : 'Hata Detayları'}
                </Text>
              </TouchableOpacity>
            )}

            {__DEV__ && this.state.showDetails && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Hata Detayları:</Text>
                <Text style={styles.errorText}>
                  {this.state.error && this.state.error.toString()}
                </Text>
                <Text style={styles.errorDetailsTitle}>Stack Trace:</Text>
                <Text style={styles.errorText}>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 400,
    width: '100%'
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 12,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  detailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  detailsButtonText: {
    color: '#6c757d',
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  errorDetails: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    width: '100%'
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginTop: 12,
    marginBottom: 8
  },
  errorText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12
  }
});

export default ErrorBoundary;
