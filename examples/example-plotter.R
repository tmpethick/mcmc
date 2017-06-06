# Initialization ----
# Load necessary libraries
library(readr)
library(ggplot2)

# If the above libraries aren't available, outcomment the following to install
#install.packages("ggplot2")
#install.packages("readr")

# Set burn-in
burn_in = 500

# Path for saving images. They can be found in the plots folder in the repository once
# this code has been run
im_path = './plots'

# Student Heights Example, Analytical vs. MCMC ----
# Simulated data to work with
heights_observed = c(200.5441,174.5726,194.1616,164.7823,196.3696,198.7111,191.0085,
                     185.4956,184.1277,168.7725,173.9352,187.2442,171.7761,214.7169,
                     174.5090,198.8049,181.9037,166.0401,196.6856,186.3147,173.8256,
                     184.1791,190.8763,180.7360,197.7508,196.2175,172.0477,166.1818,
                     183.6230,190.8607)

# Observed std and mean
sigma_obs = sd(heights_observed)
mu_obs    = mean(heights_observed)

# Length of data
n = 30

# Prior assumptions of std and mean
sd_p = 10
mu_p = 170

# Rename values to correspond with analytical example in project
tau   = sd_p
M     = mu_p
x_bar = mu_obs

# Determine analytical mean and std given the observations
mu_ana = (1/tau^2)/(1/tau^2+n/sigma_obs^2)*M+(n/sigma_obs^2)/(1/tau^2+n/sigma_obs^2)*x_bar;
sd_ana = sqrt(((sigma_obs^2/n)*tau^2)/(tau^2+sigma_obs^2/n));

# Define the proper normal distribution for plotting
norm_ana = function(mu){
  1/sqrt(2*pi*sd_ana^2)*exp(-(mu-mu_ana)^2/(2*sd_ana^2))
}

# Load the MCMC data from Metropolis-Hastings
height_mcmc_data  = read_csv("./output/height.csv",col_names = TRUE)
height_sim        = height_mcmc_data$mu

height_chain_length = length(height_mcmc_data$mu)

# Convergence plot Sigma
p <- ggplot(height_mcmc_data,aes(seq(0,height_chain_length-1),mu)) + 
  geom_point(color = "slateblue", alpha = 0.0) + 
  geom_line() +
  coord_cartesian(xlim = c(0,1000)) + 
  labs(x = "Index", y = "\u03bc") +
  theme(text = element_text(size=15))
ggsave("mu_convergence_heights.png", path = im_path)

# overlay histogram, empirical density and normal density
p0 = qplot(height_sim, geom = 'blank') +   
  geom_line(aes(y = ..density.., colour = 'Empirical'), stat = 'density') +  
  stat_function(fun = norm_ana, aes(colour = 'Analytical')) +                       
  geom_histogram(aes(y = ..density..), alpha = 0.4,binwidth = 0.1) +                        
  scale_colour_manual(name = 'Density', values = c('red', 'blue')) + 
  theme(legend.position = c(0.85, 0.85)) +
  xlab('\u03bc') +
  ylab('Density') +
  theme(text = element_text(size=15))
ggsave("analytical_mu_vs_mcmc.png", path = im_path)

# Coal Disaster Count Plot ---- 
# Hardcoded Mining Disaster Data
CoalDisast = structure(list(Year = as.integer(c(seq(1851,1962))), 
              Count = c(4, 5, 4, 1, 0, 4, 3, 4, 0, 6, 3, 3, 4, 0, 2, 6, 3, 3, 5, 4, 5, 3, 
                       1, 4, 4, 1, 5, 5, 3, 4, 2, 5, 2, 2, 3, 4, 2, 1, 3, 2, 2, 1, 1, 
                       1, 1, 3, 0, 0, 1, 0, 1, 1, 0, 0, 3, 1, 0, 3, 2, 2, 0, 1, 1, 1, 
                       0, 1, 0, 1, 0, 0, 0, 2, 1, 0, 0, 0, 1, 1, 0, 2, 3, 3, 1, 1, 2, 
                       1, 1, 1, 1, 2, 4, 2, 0, 0, 0, 1, 4, 0, 0, 0, 1, 0, 0, 0, 0, 0, 
                       1, 0, 0, 1, 0, 1)), 
              .Names = c("Year", "Count"), row.names = c(seq(1,112)), 
              class = "data.frame")

p <- ggplot(CoalDisast,aes(seq(1851,1962),Count)) + 
  geom_point(color = "slateblue") + 
  scale_x_continuous(breaks = round(seq(0, 2000, by = 10),1)) +
  labs(x = "Year", y = "Disaster Count") +
  theme(text = element_text(size=15))
ggsave("disaster_count_plot.png", path = im_path)

# Mining Disaster MCMC Result ----
mining_mcmc_data = read_csv("./output/coal.csv",col_names = TRUE)
mining_chain_length = length(mining_mcmc_data$tau)

# Convergence plot tau
p <- ggplot(mining_mcmc_data,aes(seq(0,mining_chain_length-1),tau)) + 
  geom_point(color = "slateblue", alpha = 0.0) + 
  geom_line() +
  coord_cartesian(xlim = c(0,1000)) +
  labs(x = "Index", y = "\u03C4") +
  theme(text = element_text(size=15))
ggsave("tau_convergence_mining.png", path = im_path)

# Convergence plot lambda_1
p <- ggplot(mining_mcmc_data,aes(seq(0,mining_chain_length-1),lambda1)) + 
  geom_point(color = "slateblue", alpha = 0.0) + 
  geom_line() +
  coord_cartesian(xlim = c(0,1000)) +
  labs(x = "Index", y = "\U03BB 1") +
  theme(text = element_text(size=15))
ggsave("lambda_1_convergence_mining.png", path = im_path)

# Convergence plot lambda_2
p <- ggplot(mining_mcmc_data,aes(seq(0,mining_chain_length-1),lambda2)) + 
  geom_point(color = "slateblue", alpha = 0.0) + 
  geom_line() +
  coord_cartesian(xlim = c(0,1000)) +
  labs(x = "Index", y = "\U03BB 2") +
  theme(text = element_text(size=15))
ggsave("lambda_2_convergence_mining.png", path = im_path)

# Histogram of Tau 
ggplot(data = mining_mcmc_data,aes(mining_mcmc_data$tau)) +
  geom_histogram(aes( y =..density..),
                 binwidth = 1,
                 center = 0,
                 col = "grey",
                 fill = "red",
                 alpha = 0.6) +
  labs(x = '\u03C4', y = "Density") +
  scale_x_continuous(breaks = round(seq(1851, 1962, by = 5),1)) +
  theme(text = element_text(size=20))
ggsave("mining_tau_hist.png", path = im_path)

# Histogram of lambda's
# Create row dataframe for ggplot
lambdas = rbind(data.frame(lambda = "1", lambda_val = mining_mcmc_data$lambda1),
                data.frame(lambda = "2", lambda_val = mining_mcmc_data$lambda2))

# Extract min and max for plot
min_val = floor(min(lambdas$lambda_val))
max_val = ceiling(max(lambdas$lambda_val))

ggplot(lambdas,aes(x=lambda_val, fill = lambda)) +
        geom_histogram(aes(y = ..density..), 
                 col = "grey",
                 binwidth = 0.05,
                 center = 0,
                 alpha = 0.8,
                 position = "identity") +
        labs(x = "\U03BB", y = "Density") +
        scale_fill_discrete(name = " \U03BB") +
  geom_density(alpha = 0.4) +
  scale_x_continuous(breaks = round(seq(floor(min_val), ceiling(max_val), by = 1),1)) +
  theme(text = element_text(size=20))
ggsave("mining_lambdas_hist.png", path = im_path)

# Linear Regression Data ---- 
y_with_noise = c(5.180692,7.169974,6.434389,7.957157,5.721707,7.250366,6.165940,
                 8.032859,8.921196,8.841673,5.904820,8.903951,8.432952,8.960536,
                 8.280870,7.379319,10.125117,8.927288,9.306572,10.006738,12.577144,
                 12.536051,9.125784,10.172330,11.835867,8.977479,12.496551,11.139306,
                 13.055860,10.978704,11.138134,14.577029,13.052660,12.356899,11.835723,
                 14.174058,13.614836,11.210754,12.773482,16.848817,14.069042,12.283289,
                 13.596833,14.266966,15.583467,14.928156,15.394506,15.477091,14.736643,
                 17.071796,15.735737,15.839620,16.700040,16.640124,16.387561,17.238211,
                 19.426150,18.056433,17.062086,17.049663,17.882314,16.747245,20.351004,
                 18.931540,17.765897,19.251923,17.889815,20.117700,19.555908,19.981404,
                 20.503256,21.197149,19.735683,19.280424,20.845599,20.328602,21.778517,
                 19.700871,22.616151,22.265990,21.050054,22.046396,23.403519,25.194142,
                 22.618608,24.553679,22.513082,23.782648,23.570281,24.320055,23.683706,
                 22.962444,24.315084,25.227542,24.483755,25.007571,25.795938,26.135188,
                 25.064387,25.731628)
y_with_noise_dataframe = data.frame(y = y_with_noise)

#lin_data <- read_csv("../R-Project/data_slope_2_inter_6.csv",col_names = TRUE)

# The true line
true_lin = function(x){
  2*x + 6
}

# GG plot of data
p <- ggplot(y_with_noise_dataframe,aes(seq(0,10,length.out = 100),y)) + 
  geom_point(colour = "slateblue") + 
  stat_function(fun = true_lin, lty = 2,aes(colour = "True Line \n Y = 2x+6")) +
  scale_colour_manual("", values = c("red")) +
  scale_x_continuous(breaks = round(seq(0, 10, by = 1),1)) +
  labs(x = "x", y = "Y") +
  theme(text = element_text(size=15))
p
ggsave("linear_reg_data_with_true_line.png", path = im_path)

# Linear Regression MCMC ----
linear_reg_mcmc_data = read_csv("./output/linearRegression.csv",col_names = TRUE)
lin_chain_length = length(linear_reg_mcmc_data$intercept)

# Convergence plot Sigma
p <- ggplot(linear_reg_mcmc_data,aes(seq(0,lin_chain_length-1),sigma)) + 
  geom_point(color = "slateblue", alpha = 0.0) + 
  geom_line() +
  coord_cartesian(xlim = c(0,1000)) +
  labs(x = "Index", y = "\u03c3") +
  theme(text = element_text(size=15))
ggsave("sigma_convergence_linear_reg.png", path = im_path)

# Convergence plot slope, alpha 
p <- ggplot(linear_reg_mcmc_data,aes(seq(0,lin_chain_length-1),slope)) + 
  geom_point(color = "slateblue", alpha = 0.0) + 
  geom_line() +
  coord_cartesian(xlim = c(0,1000)) +
  scale_y_continuous(breaks = seq(-10,5, by = 2)) +
  labs(x = "Index", y = "slope, \u03b1") +
  theme(text = element_text(size=15))
ggsave("slope_convergence_linear_reg.png", path = im_path)

# Convergence plot intercept, beta 
p <- ggplot(linear_reg_mcmc_data,aes(seq(0,lin_chain_length-1),intercept)) + 
  geom_point(color = "slateblue", alpha = 0.0) + 
  geom_line() +
  coord_cartesian(xlim = c(0,1000)) +
  labs(x = "Index", y = "slope, \u03b2") +
  theme(text = element_text(size=15))
ggsave("intercept_convergence_linear_reg.png", path = im_path)

# Throw away burn-in period
lin_mcmc_converged = linear_reg_mcmc_data[burn_in:lin_chain_length,]

# Plot of estimated slope density
ggplot(data = lin_mcmc_converged,aes(x = slope)) +
  geom_histogram(aes( y =..density..),
                 binwidth = 0.01,
                 center = 0,
                 col = "grey",
                 fill = "red",
                 alpha = 0.6) +
  geom_density(alpha = 0.4) +
  labs(x = 'slope, \u03b1', y = "Density") +
  scale_x_continuous(limits = c(1.8,2.3), breaks = round(seq(-10, 74, by = 0.1),5)) +
  theme(text = element_text(size=20))
ggsave("slope_hist_linear_reg.png", path = im_path)

# Plot of estimated intercept density
ggplot(data = lin_mcmc_converged,aes(x = intercept)) +
  geom_histogram(aes( y =..density..),
                 binwidth = 0.05,
                 center = 0,
                 col = "grey",
                 fill = "red",
                 alpha = 0.6) +
  geom_density(alpha = 0.4) +
  labs(x = 'slope, \u03b1', y = "Density") +
  scale_x_continuous(limits = c(4.5,7), breaks = round(seq(4.5, 7, by = 0.5),5)) +
  theme(text = element_text(size=20))
ggsave("intercept_hist_linear_reg.png", path = im_path)

# Plot of estimated sigma density
ggplot(data = lin_mcmc_converged,aes(x = sigma)) +
  geom_histogram(aes( y =..density..),
                 binwidth = 0.05,
                 center = 0,
                 col = "grey",
                 fill = "red",
                 alpha = 0.6) +
  geom_density(alpha = 0.4) +
  labs(x = '\u03c3', y = "Density") +
  scale_x_continuous(limits = c(0.75,1.5),breaks = round(seq(-10, 7, by = 0.25),5)) +
  theme(text = element_text(size=20))
ggsave("sigma_hist_linear_reg.png", path = im_path)

